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
exports.stateFile = exports.runCommand = void 0;
const core = __importStar(require("@actions/core"));
const exec = __importStar(require("@actions/exec"));
const path = __importStar(require("path"));
const runCommand = (command, args, options) => __awaiter(void 0, void 0, void 0, function* () {
    let output = '';
    let error = '';
    yield exec.exec(command, args, Object.assign(Object.assign({}, options), { listeners: {
            stdout: (data) => {
                output += data.toString();
            },
            stderr: (data) => {
                error += data.toString();
            }
        } }));
    core.debug(`stdout: ${output}`);
    core.debug(`stderr: ${error}`);
    return {
        output,
        error
    };
});
exports.runCommand = runCommand;
const stateFile = () => {
    const cwd = core.getInput('working-directory');
    const backendScope = core.getInput('backend-scope');
    const repo = process.env.GITHUB_REPOSITORY;
    const fileName = 'terraform.tfstate';
    if (repo === undefined) {
        throw new Error('GITHUB_REPOSITORY is undefined');
    }
    const refName = process.env.GITHUB_REF_NAME;
    if (refName === undefined) {
        throw new Error('GITHUB_REF_NAME is undefined');
    }
    let key;
    if (backendScope !== '') {
        key = path.join(repo, refName, backendScope, fileName);
    }
    else if (cwd !== '') {
        key = path.join(repo, refName, cwd, fileName);
    }
    else {
        key = path.join(repo, refName, fileName);
    }
    core.info(`Using S3 key: ${key}`);
    return key;
};
exports.stateFile = stateFile;
