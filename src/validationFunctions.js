import database from "./databaseConnectivity.js";

export function containsNumber(str) {
    return /\d/.test(str);
}

export function containsSpecialChars(str) {
    const specialChars = /[!?:.]/;
    return specialChars.test(str);
}

export async function validateEmail(email) {
    const emailCheck = await database.raw(`select email from CLIENTS where email='${email}'`)
    if (emailCheck.length > 0) {
        console.log("Email already exist");
        return false;
    } else if (email.length < 5 || email.length > 20) {
        console.log("Email must be between 5 and 20 characters");
        return false;
    } else {
        return true;
    }
}

export function validatePassword(password) {
    if (password.length < 5 || password.length > 20 || !containsNumber(password) || !containsSpecialChars(password)) {
        return false;
    } else {
        return true;
    }
}