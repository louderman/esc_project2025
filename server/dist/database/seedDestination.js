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
const fs_1 = require("fs");
const db_1 = require("./db");
const DESTINATION_JSON_PATH = './public/destinations.json';
const raw = (0, fs_1.readFileSync)(DESTINATION_JSON_PATH, 'utf-8');
const obj = JSON.parse(raw);
console.log(obj.length);
function seed() {
    return __awaiter(this, void 0, void 0, function* () {
        yield db_1.pool.query(`TRUNCATE TABLE Destination`);
        for (let o of obj) {
            yield db_1.pool.query(`
        INSERT INTO Destination (dest_id, term, lat, lng, type) VALUES (?, ?, ?, ?, ?)
        `, [o.uid, o.term, o.lat, o.lng, o.type]);
        }
        console.log('Seed succeed.');
    });
}
// CREATE TABLE Destination (id INT AUTO_INCREMENT PRIMARY KEY, dest_id VARCHAR(4), term VARCHAR(255), lat FLOAT, lng FLOAT, type VARCHAR(100));
seed().catch((err) => {
    console.error('Seeding failed:', err);
    process.exit(1);
});
