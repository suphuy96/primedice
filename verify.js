const clientSeed = '09db278b06330490fsdfasdf'; // dont forget to exclude the dash and the nonce!
const serverSeed = 'bc5a1dc64ed7e9cfed0dd994b62512de625e46d994a0a1efd6e4e9d2cac8973b';
const serverSeedhash = '9fa14761de54d476808a960db4510f1bc9d3d992f6918054855f966ebb52e5ef';
// https://dicesites.com/primedice/verifier?ss=bc5a1dc64ed7e9cfed0dd994b62512de625e46d994a0a1efd6e4e9d2cac8973b&cs=09db278b06330490fsdfasdf&ln=26&n=0&ssh=9FA14761DE54D476808A960DB4510F1BC9D3D992F6918054855F966EBB52E5EF
// bet made with seed pair (excluding current bet)
var nonce = 20;

// crypto lib for hmac function
const crypto = require('crypto');

const roll = function(key, text) {
    // create HMAC using server seed as key and client seed as message
    const hash = crypto
        .createHmac('sha512', key)
        .update(text)
        .digest('hex');

    let index = 0;
// console.log(hash)
    let lucky = parseInt(hash.substring(index * 5, index * 5 + 5), 16);

    // keep grabbing characters from the hash while greater than
    while (lucky >= Math.pow(10, 6)) {
        index++;
        lucky = parseInt(hash.substring(index * 5, index * 5 + 5), 16);

        // if we reach the end of the hash, just default to highest number
        if (index * 5 + 5 > 128) {
            lucky = 9999;
            break;
        }
    }

    lucky %= Math.pow(10, 4);
    lucky /= Math.pow(10, 2);

    return lucky;
};
console.log(`${clientSeed}-${nonce}`)
for (let i = 1; i <30; i++) {
    nonce=i;
console.log("______________________")
    console.log(roll(serverSeed, `${clientSeed}-${nonce}`));
    console.log(roll(serverSeedhash, `${clientSeed}-${nonce}`));

}
