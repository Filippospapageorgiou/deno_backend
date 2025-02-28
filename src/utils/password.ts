import * as bcrypt from "@da/bcrypt";

export async function hashPasword(password : string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return await bcrypt.hash(password, salt);
}

export async function verifyPassword(password: string, hash:string): Promise<boolean> {
    return await bcrypt.compare(password, hash);
}