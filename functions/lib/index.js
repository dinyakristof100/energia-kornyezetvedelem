"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.proxyOpenai = exports.proxyMaps = void 0;
const functions = __importStar(require("firebase-functions"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)({ origin: true }));
app.get('/maps/api/distancematrix/json', (req, res) => {
    (async () => {
        const { origins, destinations, mode } = req.query;
        const apiKey = functions.config().googlemaps.key;
        if (!apiKey) {
            console.error('Nincs API kulcs a környezetben!');
            return res.status(500).json({ error: 'Hiányzó API kulcs' });
        }
        const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(origins)}&destinations=${encodeURIComponent(destinations)}&mode=${mode}&key=${apiKey}`;
        try {
            const fetch = (await Promise.resolve().then(() => __importStar(require('node-fetch')))).default;
            const response = await fetch(url);
            const data = await response.json();
            res.status(200).json(data);
        }
        catch (err) {
            console.error('Google API hívás hiba:', err);
            res.status(500).json({ error: 'Google API hívás sikertelen' });
        }
    })();
});
exports.proxyMaps = functions.https.onRequest(app);
var proxy_openai_1 = require("./proxy-openai");
Object.defineProperty(exports, "proxyOpenai", { enumerable: true, get: function () { return proxy_openai_1.proxyOpenai; } });
