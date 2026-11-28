# Writes js/data/weapons.js from the owner-approved weapon looks (tools/weapon_looks.py, draft 4) (character lane, Nov 27).
# Data only: upright weapon drawings per type and look tier, the colours, each class's weapon, and each weapon item's look.
# Run: python3 tools/weapon_data.py
import os,sys,json;sys.path.insert(0,os.path.dirname(os.path.abspath(__file__)))
import weapon_looks as WL
TYPES=['staff','scepter','crook','spear','sword','mace','rapier','dagger','bow']   # locked per class (owner, Nov 27); axe, greatsword cut
# Weapon per class, locked (owner, Nov 27): type, class colour (gem from look 2), handle colour where the owner asked for one.
CLASS={'wizard':('staff','#7dbbff',None),'necro':('staff','#b48cff',None),'magician':('scepter','#ff9a4a',None),
 'enchanter':('scepter','#e0c3ff',None),'druid':('crook','#7dffa6',None),'shaman':('spear','#7de0d0',None),
 'warrior':('sword','#ffd27a',None),'shadowknight':('sword','#ff3b30','#24222a'),'cleric':('mace','#fff0b0','#d8c890'),
 'paladin':('mace','#6aa8ff','#3a68c0'),'bard':('rapier','#ff7dc8',None),'rogue':('dagger','#9aff7d',None),'ranger':('bow','#7dffa6',None)}
# The type and look tier come from each weapon item (wt, look in js/data/items.js, Items lane v0.119). Named weapons keep
# their tier's shape in their maker's colours: the Skeleton King's (b1...) and Malrec's (mal...).
def makers():
    import re
    src=open('js/data/items.js').read();out={}
    for m in re.finditer(r"\n\s*(\w+):\{([^}]*slot:'weapon'[^}]*)\}",src):
        id=m.group(1)
        if id.startswith('b1'):out[id]='sk'
        elif id.startswith('mal'):out[id]='mal'
    return out
if __name__=='__main__':
    os.chdir(os.path.join(os.path.dirname(os.path.abspath(__file__)),'..'))
    looks={t:{str(k):[v[0],v[1]] for k,v in WL.W[t].items()} for t in TYPES}
    items=makers()
    J=lambda o:json.dumps(o,separators=(',',':'))
    out=("// DATA ONLY (written by tools/weapon_data.py, do not edit by hand). Weapon looks (character lane, Nov 27; owner OK'd draft 4).\n"
    "// WEAPON_LOOKS[type][look] = [rows drawn upright, grip row]: '.' clear; the hand closes on the grip row.\n"
    "// WEAPON_PAL: base colours, metal and trim per look tier, named makers' colours. CLASS_WEAPON[class] = [type, class\n"
    "// colour (gem from look 2), handle colour or null]. WEAPON_MAKER[item] = 'sk' | 'mal' for named weapons. The type and\n"
    "// look tier are the item's own (wt, look in items.js): the look follows power, never rarity colour. Wraps never show.\n"
    "const WEAPON_LOOKS="+J(looks)+";\n"
    "const WEAPON_PAL="+J({'base':WL.BASE,'look':{str(k):v for k,v in WL.LOOK.items()},'named':WL.NAMED})+";\n"
    "const CLASS_WEAPON="+J({k:list(v) for k,v in CLASS.items()})+";\n"
    "const WEAPON_MAKER="+J(items)+";\n")
    open('js/data/weapons.js','w').write(out);print('weapons.js',len(out),'bytes,',len(items),'named weapons')
