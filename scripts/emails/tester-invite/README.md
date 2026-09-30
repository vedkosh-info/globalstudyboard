# Android tester-invite email (internal testing track)

The e-mail the owner sends to each address added to the "GlobalStudyBoard Testers"
list in the Play Console. Mirrors the VedKosh invite from Sept 2026, re-branded and
re-sequenced for Play's **internal-testing** opt-in flow (Accept invite → Download
test app) instead of VedKosh's closed-testing flow (Become a tester → download it).

- `tester-invite.html` — the e-mail, self-contained preview (open in a browser).
- `build.py` — regenerates it (`python3 build.py`); edit copy/colours here.
- `step3.png`, `step4.png` — annotated screenshots of Play's two opt-in screens,
  pasted inline in Gmail at steps 3 and 4 (600 px wide, displayed at 300 px).

How to send: in Gmail, From = contact@globalstudyboard.com, subject
"Install the GlobalStudyBoard App - Just 1 Minute & 4 Steps", paste the body, then
type the tester's Google-account address into the dashed box under step 2 and send
one message per tester. The opt-in link only works for an address already on the
Play tester list — never publish it on the site (see `lib/app-links.ts`).
