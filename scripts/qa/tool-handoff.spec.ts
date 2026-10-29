/** Independent regression checks for real tool-to-tool fragment handoffs. */
import assert from 'node:assert/strict';
import { carryHandOff, drainHandOff, handOffToTool, notePath, releaseHandOff, takeHandOff } from '../../components/tools/hand-off';
import { resumableFragment } from '../../lib/auth-events';

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
