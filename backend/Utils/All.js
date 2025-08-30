import crypto from 'crypto'
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

// --- Encryption helpers (AES-256-GCM) ---
// Key derived from SECRET env; do not rotate without migration
const ENC_KEY = crypto.createHash('sha256').update(process.env.SECRET || 'default_dev_secret').digest(); // 32 bytes

export function encryptString(plain){
    if (plain == null) return ''
    const iv = crypto.randomBytes(12)
    const cipher = crypto.createCipheriv('aes-256-gcm', ENC_KEY, iv)
    const encrypted = Buffer.concat([cipher.update(String(plain), 'utf8'), cipher.final()])
    const tag = cipher.getAuthTag()
    // store as ivHex:ctBase64:tagHex
    return `${iv.toString('hex')}:${encrypted.toString('base64')}:${tag.toString('hex')}`
}

export function decryptString(packed){
    try{
        if (!packed) return ''
        const str = String(packed)
        const parts = str.split(':')
        if (parts.length !== 3) return str // plaintext fallback
        const [ivHex, ctB64, tagHex] = parts
        const iv = Buffer.from(ivHex, 'hex')
        const ct = Buffer.from(ctB64, 'base64')
        const tag = Buffer.from(tagHex, 'hex')
        const decipher = crypto.createDecipheriv('aes-256-gcm', ENC_KEY, iv)
        decipher.setAuthTag(tag)
        const decrypted = Buffer.concat([decipher.update(ct), decipher.final()])
        return decrypted.toString('utf8')
    }catch(e){
        // on any error, return original string to avoid data loss in responses
        return String(packed)
    }
}