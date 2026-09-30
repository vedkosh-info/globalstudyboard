# Builds the GlobalStudyBoard tester-invite email (mirrors the VedKosh one from Sept 2026).
# Outputs: tester-invite.html (standalone preview, local step images) and gmail-fragment.html
# (the same markup with [[SHOT3]]/[[SHOT4]] markers where the inline screenshots go).
S="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif"   # Inter fallback
G="font-family:Georgia,'Times New Roman',serif"                               # Fraunces fallback
FOREST="#14532D"; TERRA="#C2410C"; TERRA_D="#A0340A"; INK="#292524"; BODY="#57534E"; MUTE="#78716C"
CREAM="#FFF8E7"; CREAM50="#FFFDF7"; LINE="#FBEFCC"; LINE2="#F5E3A8"
LINK="https://play.google.com/apps/internaltest/4701607353482478094"
LINK_TXT="play.google.com/apps/internaltest/4701607353482478094"
LOGO="https://www.globalstudyboard.com/icons/icon-192.png"

def num(n): return (f'<td width="30" valign="top" style="width:30px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr>'
  f'<td align="center" width="26" height="26" style="width:26px;height:26px;background:{FOREST};border-radius:999px;{G};font-size:14px;color:#FFFFFF;line-height:26px">{n}</td></tr></table></td>')
def ttl(t): return f'<div style="{G};font-size:19px;line-height:1.3;color:{INK}">{t}</div>'
def sub(t): return f'<div style="{S};font-size:14px;line-height:1.5;color:{BODY};padding-top:4px">{t}</div>'
def shot(src): return f'<div style="padding:11px 0 0 41px"><img src="{src}" width="300" alt="" style="display:block;width:300px;max-width:100%;height:auto;border:1px solid {LINE};border-radius:12px"></div>'

def build(shot3, shot4):
  return f'''<div style="background:{CREAM};padding:20px 8px"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="580" style="width:580px;max-width:580px;margin:0 auto;background:#FFFFFF;border:1px solid {LINE};border-radius:18px">
<tr><td style="height:5px;line-height:5px;font-size:0;background:{FOREST};border-radius:18px 18px 0 0">&nbsp;</td></tr>
<tr><td align="center" style="background:{CREAM50};padding:22px 28px 18px"><img src="{LOGO}" width="50" height="50" alt="GlobalStudyBoard" style="display:block;border:0;width:50px;height:50px;border-radius:12px;margin:0 auto 10px"><div style="{G};font-size:23px;line-height:1.1;font-weight:bold;letter-spacing:0.3px;color:{FOREST}">GlobalStudyBoard</div><div style="{S};font-size:11px;line-height:1.4;letter-spacing:1.2px;text-transform:uppercase;color:{MUTE};padding-top:6px">Universities &middot; Entrance exams &middot; Study abroad</div></td></tr>
<tr><td style="padding:22px 28px 0"><div style="{G};font-size:18px;line-height:1.4;color:{INK}">Sitaram,</div></td></tr>
<tr><td style="padding:14px 28px 0"><div style="{G};font-size:26px;line-height:1.25;color:{INK}">Install the GlobalStudyBoard app</div><div style="{S};font-size:15px;line-height:1.5;color:{MUTE};padding-top:5px">4 steps &middot; about 1 minute &middot; Android phone</div></td></tr>

<tr><td style="padding:22px 28px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>{num(1)}<td valign="top" style="padding-left:11px">{ttl('Open this link in Chrome')}</td></tr></table>
<div style="padding:11px 0 0 41px"><table role="presentation" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background:{TERRA};border-radius:999px"><a href="{LINK}" target="_blank" style="display:inline-block;padding:13px 32px;{S};font-size:16px;font-weight:bold;color:#FFFFFF;text-decoration:none">Open testing link &nbsp;&rarr;</a></td></tr></table>
<div style="{S};font-size:12px;line-height:1.55;color:{MUTE};padding-top:9px">Or copy this link: <a href="{LINK}" target="_blank" style="color:{TERRA};word-break:break-all;text-decoration:underline">{LINK_TXT}</a></div></div></td></tr>

<tr><td style="padding:20px 28px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>{num(2)}<td valign="top" style="padding-left:11px">{ttl(f'Sign in with <span style="color:{TERRA_D}">this</span> Google account')}{sub('Only this address is invited.')}</td></tr></table>
<div style="padding:11px 0 0 41px"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:{CREAM};border:1px dashed {TERRA};border-radius:10px"><tr><td align="center" style="padding:13px 14px"><div style="{S};font-size:19px;font-weight:bold;color:{TERRA};border-bottom:2px solid {LINE2};padding-bottom:5px;display:inline-block;min-width:250px">&nbsp;</div></td></tr></table>
<div style="{S};font-size:14px;line-height:1.5;color:{BODY};padding-top:9px">Different account? Tap the profile circle (top right) &rarr; switch to this email.</div></div></td></tr>

<tr><td style="padding:20px 28px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>{num(3)}<td valign="top" style="padding-left:11px">{ttl('Tap &ldquo;Accept invite&rdquo;')}</td></tr></table>{shot3}</td></tr>

<tr><td style="padding:20px 28px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%"><tr>{num(4)}<td valign="top" style="padding-left:11px">{ttl('Tap &ldquo;Download test app&rdquo;')}{sub(f'Then tap <b style="color:{INK}">Install</b> on Google Play.')}</td></tr></table>{shot4}</td></tr>

<tr><td style="padding:22px 28px 0"><table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background:{CREAM50};border:1px solid {LINE};border-radius:12px"><tr><td align="center" style="padding:13px;{S};font-size:15px;line-height:1.5;color:#44403C">Wait a few minutes &mdash; the app installs. <b style="color:{INK}">Done.</b></td></tr></table></td></tr>
<tr><td style="padding:18px 28px 0"><div style="{S};font-size:14px;line-height:1.55;color:{BODY}">Stuck? Just reply to this email.</div></td></tr>
<tr><td style="padding:18px 28px 0"><div style="{G};font-size:16px;line-height:1.5;color:{INK}">Team GlobalStudyBoard</div><div style="{G};font-size:15px;line-height:1.5;color:{TERRA};padding-top:6px">Har Har Mahadev</div></td></tr>
<tr><td style="padding:18px 28px 24px"><div style="height:1px;line-height:1px;font-size:0;background:{LINE};margin-bottom:12px">&nbsp;</div><div style="{S};font-size:11px;line-height:1.6;color:#A8A29E"><a href="https://www.globalstudyboard.com" target="_blank" style="color:{TERRA};text-decoration:none;font-weight:bold">globalstudyboard.com</a> &middot; contact@globalstudyboard.com</div></td></tr>
<tr><td style="height:5px;line-height:5px;font-size:0;background:{FOREST};border-radius:0 0 18px 18px">&nbsp;</td></tr>
</table></div>'''

preview=build(shot('step3.png'), shot('step4.png'))
open('tester-invite.html','w').write('<!doctype html><meta charset="utf-8"><title>GlobalStudyBoard tester invite</title><body style="margin:0;background:#FFF8E7">'+preview+'</body>')
frag=build('<div style="padding:11px 0 0 41px" data-gsb="3">[[SHOT3]]</div>','<div style="padding:11px 0 0 41px" data-gsb="4">[[SHOT4]]</div>')
open('gmail-fragment.html','w').write(frag)
print('ok', len(preview), len(frag))
