import { CpuInfo } from "os";

import { streamWrite, streamEnd, readableToString } from "@rauschma/stringio";
import * as cp from 'child_process';

export async function onExit(childProcess: cp.ChildProcess) {
    return new Promise(async (resolve, reject) => {
        childProcess.once('exit', async (code, signal) => {
            if (code === 0) {
                resolve(undefined);
            }
            else {
                if (childProcess.stderr === null) {
                    reject(new Error('Exit with error code: ' + code));
                } else {
                    const errorOutput = await readableToString(childProcess.stderr);
                    reject(new Error('Exit with error code: ' + code + '\n' + errorOutput));
                }
            }
        });
        childProcess.once('error', async (err) => {
            if (childProcess.stderr === null) {
                reject(err);
            } else {
                const errorOutput = await readableToString(childProcess.stderr);
                reject(`${err.name}: ${err.message} \n`  + errorOutput);
            }
        });
    });
}
