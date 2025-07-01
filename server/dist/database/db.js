"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
exports.cleanup = cleanup;
exports.sync = sync;
const mysql = require('mysql2');
const pool = mysql
    .createPool({
    host: 'localhost',
    user: 'ItsMeOX',
    password: 'password',
    database: 'ESC',
})
    .promise();
exports.pool = pool;
function cleanup() {
    return __awaiter(this, void 0, void 0, function* () {
        yield pool.end();
    });
}
function sync() {
    return __awaiter(this, void 0, void 0, function* () { });
}
// CREATE USER 'your_username'@'your_host' IDENTIFIED BY 'your_password';
// GRANT ALL PRIVILEGES ON db_name.* TO 'your_username'@'localhost';
// FLUSH PRIVILEGES;
