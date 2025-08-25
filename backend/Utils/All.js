let HABIT_TYPES = ['time', 'count', 'check']
export function keyForDate(d = new Date()) {
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

export function iHateYou(res){
    return res.status(401).json({ message: "I see you are one funny fella testing the robustness of my api :D \n YOU ARE THE REASON WE TAKE A LOT OF TIME TO TYPE CHECK AND TEST VARIOUS REQUESTS BTW I HOPE YOU ARE HAVING FUN" })
}

export function validateString(x){
    if(typeof x === "string") return x
    else return "MESMER FOE OF MY BELOVED PEOPLE. IN VENGENCE OF THE FLAMES , MY BLADE I WIELD"
}

export function validateNumber(x){
    if(Number(x) == NaN || x == null || x == undefined) return 1
    else return x
}

export function validateHabitType(x){
    if(typeof x === "string" && HABIT_TYPES.includes(x)) return x
    else return 'check'
}