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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ssr = void 0;
const admin = __importStar(require("firebase-admin"));
const https_1 = require("firebase-functions/v2/https");
admin.initializeApp();
exports.ssr = (0, https_1.onRequest)({
    region: "europe-west1",
    memory: "1GiB",
    timeoutSeconds: 60,
    cors: true,
}, (req, res) => {
    try {
        const path = require("path");
        const fs = require("fs");
        const absMainPath = path.resolve(__dirname, "..", "angular-ssr", "main.js");
        // DOM shim
        try {
            const idx = path.resolve(__dirname, "..", "angular-ssr", "index.html");
            if (fs.existsSync(idx)) {
                const shimPath = path.resolve(__dirname, "../server-dom-shim-lazy.js");
                if (fs.existsSync(shimPath)) {
                    const shim = require(shimPath);
                    if (typeof shim === "function")
                        shim(idx);
                }
            }
        }
        catch (e) {
            console.warn("DOM shim not loaded:", e?.message || e);
        }
        // Load server bundle
        const moduleLoaded = require(absMainPath);
        const server = moduleLoaded.app
            ? moduleLoaded.app()
            : moduleLoaded.default
                ? moduleLoaded.default()
                : moduleLoaded;
        return server(req, res);
    }
    catch (err) {
        console.error("SSR error:", err);
        return res.status(500).send("Internal Server Error");
    }
});
