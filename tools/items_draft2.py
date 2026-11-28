# Items lane, draft 2 (Nov 27): more items for every class + a stat budget so they're balanced from day one.
# Prints a markdown section for docs/research/gold-and-items.md and writes the owner's review page (out/items-draft2.html).
# Budget points = STR + STA + WIS + INT + AC/2, scaled by slot (weapon and chest 1.0; head, legs, off-hand 0.8; hands, feet, ring 0.6).
import html, os
W={'weapon':1,'chest':1,'head':.8,'legs':.8,'offhand':.8,'hands':.6,'feet':.6,'ring':.6,'neck':.8}
TARGET={'common':2,'uncommon':4.5,'rare':8,'sk':9,'named':9,'mal':11}  # at slot weight 1
def pts(it): return sum(it.get(k,0) for k in ('str','sta','wis','int'))+it.get('ac',0)/2
def stats(it): return ' '.join(f"{k.upper()} {it[k]}" for k in ('ac','str','sta','wis','int') if it.get(k))

# ---- Weapons: one ladder per weapon type (who uses it, and the Zone 1 steps). 'keep' = existing item, 'new', 'change'.
WEAP=[
 ('Staff','Wizard, Necromancer',[
  ('keep','common','Oak Staff',dict(int=1)),('new','uncommon','Grave-ash Staff',dict(int=3,wis=1)),
  ('new','rare','Staff of the Low Moon',dict(int=5,wis=2,sta=1)),('change','sk',"Skeleton King's Staff",dict(int=6,wis=2,sta=1)),
  ('change','mal',"Malrec's Censer-staff",dict(int=7,wis=3,sta=1))]),
 ('Scepter','Magician, Enchanter',[
  ('new','common','Tin Scepter',dict(int=1,wis=1)),('new','uncommon','Candlewax Scepter',dict(int=3,wis=1)),
  ('new','rare','Emberglass Scepter',dict(int=5,sta=2,wis=1)),('new','sk',"Skeleton King's Scepter",dict(int=6,wis=2,sta=1)),
  ('new','mal',"Malrec's Thurible",dict(int=7,wis=2,sta=2))]),
 ('Crook','Druid',[
  ('new','common','Gnarled Crook',dict(int=1,wis=1)),('change','uncommon','Thornwood Crook (was Thornwood Staff)',dict(int=3,wis=1)),
  ('new','rare','Mossheart Crook',dict(int=4,wis=3,sta=1)),('new','sk',"Skeleton King's Crook",dict(int=5,wis=3,sta=1)),
  ('new','mal',"Malrec's Briar Crook",dict(int=6,wis=4,sta=1))]),
 ('Spear','Shaman',[
  ('keep','common','Fishing Spear',dict(str=1,wis=1)),('keep','uncommon','Bone Spear',dict(wis=2,int=1,str=1)),
  ('new','rare','Wolfbone Spear',dict(wis=3,int=3,sta=2)),('change','sk',"Skeleton King's Spear",dict(int=5,wis=3,sta=1)),
  ('change','mal',"Malrec's Smoke Spear",dict(int=6,wis=4,sta=1))]),
 ('Sword','Warrior, Shadow Knight',[
  ('keep','common','Rusty Sword',dict(str=1)),('change','uncommon','Grave-iron Sword (was the Axe and the Greatsword)',dict(str=3,sta=1)),
  ('new','rare','Gravewarden Blade',dict(str=5,sta=3)),('change','sk',"Skeleton King's Blade (Greatsword folded in)",dict(str=6,sta=3)),
  ('change','mal',"Malrec's Headsman Blade (was the Axe; Ashen Greatsword folded in)",dict(str=7,sta=4))]),
 ('Mace','Cleric, Paladin',[
  ('keep','common','Iron Mace',dict(str=1,wis=1)),('keep','uncommon','Blessed Mace',dict(str=2,wis=2)),
  ('new','rare','Vigil Mace',dict(str=3,wis=3,sta=2)),('change','sk',"Skeleton King's Mace",dict(str=4,wis=3,sta=2)),
  ('change','mal',"Malrec's Ember Mace",dict(str=5,wis=4,sta=2))]),
 ('Rapier','Bard',[
  ('keep','common','Thin Rapier',dict(str=1)),('keep','uncommon','Silver Rapier',dict(str=3,sta=1)),
  ('new','rare','Moonsteel Rapier',dict(str=5,sta=2,wis=1)),('change','sk',"Skeleton King's Rapier",dict(str=6,sta=2,wis=1)),
  ('change','mal',"Malrec's Vesper Rapier",dict(str=7,sta=3,wis=1))]),
 ('Dagger','Rogue',[
  ('keep','common','Chipped Dagger',dict(str=1)),('keep','uncommon','Bone-hilt Dirk',dict(str=3,sta=1)),
  ('new','rare',"Cutthroat's Kris",dict(str=6,sta=2)),('change','sk',"Skeleton King's Dagger",dict(str=7,sta=2)),
  ('change','mal',"Malrec's Ritual Knife",dict(str=8,sta=3))]),
 ('Bow','Ranger',[
  ('keep','common','Hunting Bow',dict(str=1)),('keep','uncommon','Yew Longbow',dict(str=3,sta=1)),
  ('new','rare','Ashwood Recurve',dict(str=6,sta=2)),('change','sk',"Skeleton King's Bow",dict(str=7,sta=2)),
  ('change','mal',"Malrec's Pyre Bow",dict(str=8,sta=3))]),
 ('Hand wraps (Monk, never shown)','Monk',[
  ('keep','common','Cloth Wraps',dict(str=1)),('keep','uncommon','Iron Knuckles',dict(str=3,sta=1)),
  ('new','rare','Ironpalm Wraps',dict(str=6,sta=2)),('change','sk',"Skeleton King's Fist Wraps",dict(str=7,sta=2)),
  ('change','mal',"Malrec's Penitent Wraps",dict(str=8,sta=3))]),
]
# ---- New blue armour: two more per gear group, in slots that had no blue.
ARMOR=[
 ('Casters (Druid, Necro, Enchanter, Wizard, Magician; Shaman too)',[('head','Cowl of Quiet Graves',dict(ac=2,int=2,wis=2,sta=1)),('offhand','Lantern of the Lost',dict(int=3,wis=2,sta=1))]),
 ('Warrior gear (Warrior, Paladin, Shadow Knight)',[('head','Gravewarden Helm',dict(ac=4,sta=2,str=2)),('legs','Barrow-iron Greaves',dict(ac=4,sta=3,str=1))]),
 ('Knight gear (Paladin, Shadow Knight)',[('chest','Oathsworn Hauberk',dict(ac=7,sta=3,wis=2)),('offhand','Tower of the Vigil (shield)',dict(ac=5,sta=2,wis=1))]),
 ('Rogue',[('head','Nightveil Hood',dict(ac=2,str=3,sta=2)),('offhand','Fenrunner Main-gauche',dict(str=3,sta=2,ac=1))]),
 ('Cleric',[('head','Mitre of Mercy',dict(ac=3,wis=3,sta=1)),('offhand','Sanctuary Ward (shield)',dict(ac=4,wis=2,sta=2))]),
 ('Ranger',[('head','Hawkfeather Cap',dict(ac=2,str=3,sta=2)),('offhand','Quiver of Grey Fletching',dict(str=4,sta=2))]),
 ('Monk',[('legs','Wind-step Trousers',dict(ac=3,str=2,sta=2)),('hands','Stonefist Bindings',dict(ac=2,str=2,sta=1))]),
 ('Shaman',[('head','Antler Headdress',dict(ac=2,wis=3,int=1,sta=1)),('offhand','Totem of the Fen',dict(wis=3,int=2,sta=1))]),
 ('Bard',[('head',"Minstrel's Feathered Hat",dict(ac=2,sta=2,wis=2,str=1)),('offhand','Lute of Low Bells',dict(wis=3,int=2,sta=1))]),
]
# ---- Any class: fill empty slots (hands, legs, feet) with greens, and give each rare mob its own item.
SHARED=[
 ('new','uncommon','hands','Wolfhide Gloves',dict(ac=2,sta=1),'any mob'),
 ('new','uncommon','legs',"Gravedigger's Breeches",dict(ac=2,sta=1,str=1),'any mob'),
 ('new','rare','hands','Ironshell Bracers',dict(ac=3,sta=3),'Ironshell (rare, level 3)'),
 ('new','rare','feet',"Tunnel-runner's Boots",dict(ac=2,sta=2,str=1),'the Pale Rat (rare, level 5)'),
 ('new','rare','head',"Bride's Mourning Veil",dict(ac=2,wis=3,int=2),'the Weeping Bride (rare, level 8)'),
 ('new','rare','ring','Ember-knot Ring',dict(sta=2,int=1,wis=1,str=1),'the Ashen Acolyte (rare, level 14)'),
 ('new','named','hands',"Old Scar's Hide Grips",dict(ac=3,sta=3,str=2),'Old Scar (named, level 11) — had no item'),
 ('new','named','head',"Greyfang's Ruff",dict(ac=3,sta=3,wis=2,str=1),'Greyfang (named, level 11) — a second pink beside his ring'),
]
# ---- Fixes to keep the order white < green < blue < Skeleton King < Dungeon 1 named < Malrec.
FIXES=[
 "Skeleton King's chests (Robe, Breastplate, Hauberk, Jerkin, Cloak, Gi, Mantle, Coat) are worth less than the blue chests (7.5–8 points vs 8.5–9): add 1 STA each so his pinks sit just above blues.",
 "Skeleton King's weapons go from 7 to 9 points and Malrec's from 9–11 to 11 for everyone (the Smoke Spear was 9, the Censer-staff 11), so no class's Malrec weapon is weaker than another's.",
 "Weapons are picked by weapon type, not gear group: a Paladin now finds maces (the Cleric's ladder), Wizards and Necros staffs, Magicians and Enchanters scepters, the Druid crooks. Armour stays by gear group.",
 "Cut: the Grave-iron Axe, the Grave-iron Greatsword, Skeleton King's Greatsword, Malrec's Ashen Greatsword (folded into the sword ladder). Saves that hold one become the sword of the same step.",
]
RLAB={'common':'White','uncommon':'Green','rare':'Blue','sk':'Skeleton King pink','named':'Named pink','mal':'Malrec pink'}
RCOL={'common':'#e8e2cf','uncommon':'#5fdf6f','rare':'#5fa8ff','sk':'#ff9de2','named':'#ff9de2','mal':'#ff9de2'}
def check(rar,slot,it):
    t=TARGET[rar]*W[slot];p=pts(it);return p,t

def md():
    o=["## Items lane, draft 2 (Nov 27): more items for every class","",
       "Budget points = STR + STA + WIS + INT + AC/2, times the slot weight (weapon, chest 1; head, legs, off-hand 0.8; hands, feet, ring 0.6). Zone 1 targets at weight 1: white 2, green 4.5, blue 8, Skeleton King and named pinks 9, Malrec 11.",""]
    for t,who,rows in WEAP:
        o.append(f"**{t}** ({who}): "+'; '.join(f"{n} [{RLAB[r]}, {stats(s)}]{'' if k=='keep' else ' ('+k+')'}" for k,r,n,s in rows))
    o.append("");o.append("**New blue armour:** "+'; '.join(f"{g}: "+', '.join(f"{n} ({sl}, {stats(s)})" for sl,n,s in its) for g,its in ARMOR))
    o.append("");o.append("**Any class:** "+'; '.join(f"{n} ({RLAB[r]} {sl}, {stats(s)}; {src})" for k,r,sl,n,s,src in SHARED))
    o.append("");o.append("**Fixes:** "+' '.join(FIXES));return '\n'.join(o)

def page():
    e=html.escape
    def row(r,name,slot,s,extra=''):
        p,t=check(r,slot,s);ok=abs(p-t)<=1.25
        return f"<tr><td><span class=dot style='background:{RCOL[r]}'></span>{e(name)}{extra}</td><td>{e(RLAB[r])}</td><td class=st>{e(stats(s))}</td><td class=n>{p:g}<small> / {t:g}</small></td></tr>"
    tag=lambda k:'' if k=='keep' else f" <span class='tag {k}'>{k}</span>"
    w=''.join(f"<h3>{e(t)} <small>{e(who)}</small></h3><div class=scroll><table class=stack><thead><tr><th>Item</th><th>Rarity</th><th>Stats</th><th>Points / target</th></tr></thead><tbody>"+''.join(row(r,n,'weapon',s,tag(k)) for k,r,n,s in rows)+"</tbody></table></div>" for t,who,rows in WEAP)
    a=''.join(f"<h3>{e(g)}</h3><div class=scroll><table class=stack><thead><tr><th>Item</th><th>Rarity</th><th>Stats</th><th>Points / target</th></tr></thead><tbody>"+''.join(row('rare',f"{n} ({sl})",sl,s) for sl,n,s in its)+"</tbody></table></div>" for g,its in ARMOR)
    sh="<div class=scroll><table class=stack><thead><tr><th>Item</th><th>Rarity</th><th>Stats</th><th>Points / target</th><th>Drops from</th></tr></thead><tbody>"+''.join(row(r,f"{n} ({sl})",sl,s).replace('</tr>',f"<td>{e(src)}</td></tr>") for k,r,sl,n,s,src in SHARED)+"</tbody></table></div>"
    fx=''.join(f"<li>{e(f)}</li>" for f in FIXES)
    nw=sum(1 for _,_,rows in WEAP for k,*_ in rows if k=='new');na=sum(len(i) for _,i in ARMOR);ns=len(SHARED)
    return f"""<!DOCTYPE html><html lang=en><head><meta charset=utf-8><meta name=viewport content="width=device-width,initial-scale=1"><title>Items draft 2</title>
<link href="https://fonts.googleapis.com/css2?family=Pixelify+Sans:wght@500;700&family=Inter:wght@400;600&display=swap" rel=stylesheet>
<style>
/* VOICE: a quartermaster's ledger, plain and exact
   IDEA: the loot table pinned up in a guild hall, one ladder per weapon
   PICTURE: the rarity ladder bar up top, then the tables themselves
   COLOUR and TYPE: soot ground, bone text, the game's rarity colours as the only accents; Pixelify Sans titles, Inter body
   LAYOUT: one column: what this is, the budget ladder, weapons, blues, any-class, fixes, questions */
:root{{color-scheme:dark;--bg:#1c1a22;--panel:#26232e;--ink:#e8e2d4;--dim:#a49cae;--line:#3a3644}}
*{{box-sizing:border-box;min-width:0}}body{{margin:0;background:var(--bg);color:var(--ink);font:16px/1.55 Inter,system-ui,sans-serif;overflow-x:clip}}
.band{{padding:clamp(22px,4vw,48px) max(5vw,16px);max-width:900px;margin:auto}}
h1,h2{{font-family:'Pixelify Sans',monospace;line-height:1.1;margin:0 0 10px}}h1{{font-size:clamp(30px,6vw,44px)}}h2{{font-size:24px;margin-top:34px;color:#ffd27a}}
h3{{font-size:17px;margin:22px 0 6px}}h3 small{{color:var(--dim);font-weight:400}}
.ladder{{display:flex;gap:4px;margin:14px 0 4px}}.ladder div{{flex:1;padding:10px 6px;border-radius:6px;background:var(--panel);text-align:center;font-size:13px}}
.ladder b{{display:block;font-size:22px;font-family:'Pixelify Sans'}}
table{{width:100%;border-collapse:collapse;font-size:15px}}th,td{{text-align:left;padding:7px 8px;border-bottom:1px solid var(--line)}}th{{color:var(--dim);font-weight:600;font-size:13px}}
td.n{{text-align:right;white-space:nowrap}}td.n small{{color:var(--dim)}}td.st{{white-space:nowrap}}
.dot{{display:inline-block;width:10px;height:10px;border-radius:2px;margin-right:7px;vertical-align:baseline}}
.tag{{font-size:12px;padding:1px 6px;border-radius:4px;background:#3a3644;color:#cfc8b2;margin-left:4px}}.tag.new{{background:#24452a;color:#9fe8a8}}.tag.change{{background:#4a3a1a;color:#ffd27a}}
.dim{{color:var(--dim);font-size:14px}}.scroll{{overflow-x:auto}}li{{margin-bottom:8px}}
@media(max-width:600px){{table{{font-size:13px}}.stack thead{{display:none}}.stack tr{{display:grid;padding-block:10px}}.stack td{{display:flow-root;border:0;padding:3px 0;padding-inline-start:8em;text-align:start}}.stack td::before{{content:attr(data-l);float:inline-start;width:7.5em;margin-inline-start:-8em;white-space:normal;color:var(--dim)}}.stack td:empty{{display:none}}.ladder b{{font-size:18px}}}}
</style><script>new MutationObserver(()=>{{for(const c of document.querySelectorAll('.stack td:not([data-l])')){{let i=0,p=c;while(p=p.previousElementSibling)i+=p.colSpan;c.dataset.l=c.closest('table').rows[0].cells[i]?.textContent||''}}}}).observe(document,{{childList:true,subtree:true}})</script></head><body><div class=band>
<h1>Items · draft 2</h1>
<p>More items for every class: a full Zone 1 ladder for each weapon type, two more blues per gear group, and an item of their own for every rare and named that lacked one. {nw} new weapons, {na} new blue armour pieces, {ns} any-class items. Nothing is in the game yet.</p>
<h2>The balance rule</h2>
<p>Every item gets <b>points</b>: STR + STA + WIS + INT + half its AC, scaled by slot (weapon and chest count fully; head, legs and off-hand 80%; hands, feet and ring 60%). Each rarity has a target, so a step up is always a real step up:</p>
<div class=ladder><div style="color:#e8e2cf"><b>2</b>white</div><div style="color:#5fdf6f"><b>4.5</b>green</div><div style="color:#5fa8ff"><b>8</b>blue</div><div style="color:#ff9de2"><b>9</b>Skel. King, named</div><div style="color:#ff9de2"><b>11</b>Malrec</div></div>
<p class=dim>Targets for a weapon or chest. The tables show each item's points against its slot's target. Drop rates stay as they are (v0.97): gear stays sparse.</p>
<h2>Weapons: one ladder per type</h2><p class=dim>Tags: <span class='tag new'>new</span> a new item, <span class='tag change'>change</span> an existing item with new stats or type. Untagged items stay as they are.</p>{w}
<h2>Two more blues per gear group</h2><p class=dim>Every group's only blue was a chest piece. These fill a head and an off-hand (or legs and hands for the Monk).</p>{a}
<h2>Any class: empty slots and rare mobs</h2><p class=dim>Hands and legs had only one white each. Rare mobs now have a small chance to drop their own blue instead of a random one; Old Scar finally drops something.</p>{sh}
<h2>Fixes to existing items</h2><ol>{fx}</ol>
<h2>Questions for you</h2><ol>
<li>Rare mobs: their own blue <b>30% of the time</b> they'd drop a blue, or every time?</li>
<li>Greyfang: a second pink (the Ruff) beside his ring, or keep him to the ring?</li>
<li>Names are placeholders until the setting is decided. Any you want changed now?</li></ol>
</div></body></html>"""

if __name__=='__main__':
    os.makedirs('out',exist_ok=True);open('out/items-draft2.html','w').write(page());print(md())
    # budget check: flag anything more than 1.25 points off its target
    for t,who,rows in WEAP:
        for k,r,n,s in rows:
            p,tg=check(r,'weapon',s)
            if abs(p-tg)>1.25: print('OFF',n,p,tg)
    for g,its in ARMOR:
        for sl,n,s in its:
            p,tg=check('rare',sl,s)
            if abs(p-tg)>1.25: print('OFF',n,p,tg)
    for k,r,sl,n,s,src in SHARED:
        p,tg=check(r,sl,s)
        if abs(p-tg)>1.25: print('OFF',n,p,tg)
