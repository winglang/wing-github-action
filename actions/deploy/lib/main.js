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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const core = __importStar(require("@actions/core"));
const path = __importStar(require("path"));
const fs = __importStar(require("fs"));
const utils_1 = require("./utils");
function run() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const entrypoint = core.getInput('entry');
            const version = core.getInput('version');
            const target = core.getInput('target');
            const backend = core.getInput('backend');
            const cwd = core.getInput('working-directory');
            if (version === '') {
                throw new Error('version is required');
            }
            if (target === '') {
                throw new Error('target is required');
            }
            if (backend === '') {
                throw new Error('backend is required');
            }
            if (entrypoint === '') {
                throw new Error('entry is required');
            }
            if (cwd !== '') {
                core.info(`Changing directory to ${cwd}`);
                process.chdir(path.join(process.cwd(), cwd));
            }
            const main = path.basename(entrypoint, '.w');
            const workdir = path.dirname(entrypoint);
            // debug is only output if you set the secret `ACTIONS_STEP_DEBUG` to true
            core.debug(`Using ${entrypoint} ...`);
            yield (0, utils_1.runCommand)('npm', ['install', '-g', `winglang@${version}`]);
            core.info(`Installed winglang@${version}`);
            // if package.json exists, install dependencies
            if (fs.existsSync(path.join(process.cwd(), 'package.json'))) {
                yield (0, utils_1.runCommand)('npm', ['ci']);
                core.info(`Installed NPM dependencies with npm ci`);
            }
            else {
                core.info(`No package.json found, skipping npm ci`);
            }
            const tfEnv = Object.assign(Object.assign({}, process.env), { TF_IN_AUTOMATION: 'true' });
            if (backend === 's3') {
                core.info(`Injecting backend config for S3`);
                yield (0, utils_1.runCommand)('wing', [
                    'compile',
                    '--platform',
                    target,
                    '--platform',
                    '/action/platforms/backend.s3.js',
                    entrypoint
                ], {
                    env: Object.assign(Object.assign({}, tfEnv), { TF_BACKEND_STATE_FILE: (0, utils_1.stateFile)() })
                });
            }
            else {
                yield (0, utils_1.runCommand)('wing', ['compile', '--debug', '--platform', target, entrypoint]);
            }
            const tfWorkDir = path.join(process.cwd(), workdir, 'target', `${main}.${target.replace('-', '')}`);
            yield (0, utils_1.runCommand)('terraform', ['init'], {
                cwd: tfWorkDir,
                env: tfEnv
            });
            yield (0, utils_1.runCommand)('terraform', ['apply', '-input=false', '-auto-approve'], {
                cwd: tfWorkDir,
                env: tfEnv
            });
        }
        catch (error) {
            if (error instanceof Error)
                core.setFailed(error.message);
        }
    });
}
run();
