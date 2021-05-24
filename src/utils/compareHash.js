import * as bcrypt from 'bcrypt-nodejs';

export function compareHash(string, hash) {
    return new Promise((resolve, error) => {
        bcrypt.compare(string, hash, (err, success) => {
            if (err) { return error(err) }
            resolve(success)
        })
    })
}