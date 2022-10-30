var crypto = require('crypto');
var encryptionMethod = 'AES-256-CBC';
var secret = "MY32ATGSEcretPasswordandinitVect"; //must be 32 char length
var iv = "MY32ATGSEcretPas";

exports.encrypt = function (plain_text) {
    var encryptor = crypto.createCipheriv(encryptionMethod, secret, iv);
    return encryptor.update(plain_text, 'utf8', 'base64') + encryptor.final('base64');

};

exports.decrypt = function (encryptedMessage, encryptionMethod, secret, iv) {
    var decryptor = crypto.createDecipheriv(encryptionMethod, secret, iv);
    return decryptor.update(encryptedMessage, 'base64', 'utf8') + decryptor.final('utf8');
};

 