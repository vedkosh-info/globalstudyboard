/** Independent regression checks for real tool-to-tool fragment handoffs. */
import assert from 'node:assert/strict';
import { carryHandOff, drainHandOff, handOffToTool, notePath, releaseHandOff, takeHandOff } from '../../components/tools/hand-off';
import { resumableFragment } from '../../lib/auth-events';
import { applicationCheckHref, applicationCheckProgrammeId } from '../../lib/tools';
import { PROGRAMMES } from '../../lib/application-check-catalogue';

const source = '/tools/application-planner';
const target = '/tools/scholarship-tracker';
const location = { pathname: source };
const originalWindow = Object.getOwnPropertyDescriptor(globalThis, 'window');
Object.defineProperty(globalThis, 'window', { configurable: true, value: { location } });
let checks = 0;
function check(label: string, body: () => void) {
  drainHandOff(); location.pathname = source;
  body(); checks++; console.log(`PASS ${label}`);
}

try {
  check('every reviewed programme profile hands the exact public programme and destination through sign-in', () => {
    for (const programme of PROGRAMMES) {
      const { pathname, hash } = new URL(applicationCheckHref(programme.id, programme.region), 'https://example.org');
      assert.equal(pathname, '/tools/application-check');
      assert.equal(resumableFragment(hash), hash);
      handOffToTool(pathname, hash.slice(1));
      carryHandOff(pathname, 'region=india');
      assert.equal(takeHandOff(pathname), hash.slice(1));
      assert.equal(applicationCheckProgrammeId(hash, programme.region), programme.id);
      const other = programme.region === 'india' ? 'usa' : 'india';
      assert.equal(applicationCheckProgrammeId(hash, other), null);
      const cleared = new URL(applicationCheckHref(null, programme.region), 'https://example.org').hash;
      assert.equal(cleared, `#region=${programme.region}`);
      assert.equal(applicationCheckProgrammeId(cleared, programme.region), null);
    }
  });
  check('the programme sign-in allowlist rejects duplicate, mixed, malformed and private fragment fields', () => {
    const reversed = '#region=canada&programme=example-course';
    assert.equal(resumableFragment(reversed), reversed);
    assert.equal(applicationCheckProgrammeId(reversed, 'canada'), 'example-course');
    for (const hash of [
      '#programme=bad/slug', '#programme=abc&programme=xyz', '#programme=abc&region=canada&region=usa',
      '#programme=abc&exam=ielts', '#programme=abc&score=7', '#programme=a%26b', '#programme=' + 'a'.repeat(121),
    ]) {
      assert.equal(resumableFragment(hash), '');
      assert.equal(applicationCheckProgrammeId(hash, 'canada'), null);
    }
  });
  for (const key of ['entry=00000000-0000-4000-8000-000000000001', 'award=chevening-scholarship-guide', 'exam=sat']) {
    check(`gate cleanup preserves explicit ${key.split('=')[0]} and destination`, () => {
      const fragment = `${key}&region=usa`;
      const intent = handOffToTool(target, fragment);
      location.pathname = target;
      carryHandOff(target, 'region=india');
      releaseHandOff(intent);
      const result = takeHandOff(target);
      assert.equal(result, fragment);
      assert.equal(resumableFragment(`#${result}`), `#${fragment}`);
      assert.equal(takeHandOff(target), null, 'handoff is consumed exactly once');
    });
  }
  check('an explicit preset without a destination inherits the current destination', () => {
    handOffToTool(target, 'award=chevening-scholarship-guide');
    carryHandOff(target, 'region=uk-ireland');
    assert.equal(takeHandOff(target), 'award=chevening-scholarship-guide&region=uk-ireland');
  });
  check('a carry without an explicit link still reaches the next gate', () => {
    carryHandOff(target, 'region=canada');
    assert.equal(takeHandOff(target), 'region=canada');
  });
  check('an unrelated target cannot inherit a previous record key', () => {
    handOffToTool(target, 'entry=00000000-0000-4000-8000-000000000001&region=usa');
    carryHandOff('/tools/cost-planner', 'region=india');
    assert.equal(takeHandOff('/tools/cost-planner'), 'region=india');
  });
  check('an expired explicit link is replaced with only the fresh destination carry', () => {
    const intent = handOffToTool(target, 'entry=00000000-0000-4000-8000-000000000001&region=usa');
    intent.at = Date.now() - 60_001;
    carryHandOff(target, 'region=europe');
    assert.equal(takeHandOff(target), 'region=europe');
  });
  check('a gate never consumes an expired intent', () => {
    const intent = handOffToTool(target, 'region=usa'); intent.at = Date.now() - 60_001;
    assert.equal(takeHandOff(target), null);
  });
  check('a link may unmount while navigation is still on its source page', () => {
    const intent = handOffToTool(target, 'region=usa');
    releaseHandOff(intent); notePath(source);
    assert.equal(takeHandOff(target), 'region=usa');
  });
  check('an unrelated navigation discards an abandoned intent', () => {
    handOffToTool(target, 'region=usa'); notePath('/guides');
    assert.equal(takeHandOff(target), null);
  });
  check('release after an unrelated navigation discards an abandoned link', () => {
    const intent = handOffToTool(target, 'region=usa'); location.pathname = '/about';
    releaseHandOff(intent); assert.equal(takeHandOff(target), null);
  });
  check('an old link cleanup cannot discard a newer link', () => {
    const old = handOffToTool(target, 'region=usa');
    handOffToTool('/tools/test-score-tracker', 'exam=sat&region=canada');
    location.pathname = '/tools/test-score-tracker'; releaseHandOff(old);
    assert.equal(takeHandOff('/tools/test-score-tracker'), 'exam=sat&region=canada');
  });
  check('a carry is released when its destination is abandoned', () => {
    carryHandOff(target, 'region=usa'); notePath(source);
    assert.equal(takeHandOff(target), null);
  });
} finally {
  drainHandOff();
  if (originalWindow) Object.defineProperty(globalThis, 'window', originalWindow);
  else Reflect.deleteProperty(globalThis, 'window');
}
console.log(`Independent tool handoff QA: ${checks} checks passed.`);
