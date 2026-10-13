import {execFileSync} from 'node:child_process';
import {mkdirSync,copyFileSync,lstatSync} from 'node:fs';
import {dirname,resolve,relative} from 'node:path';
const target=resolve('public');mkdirSync(target,{recursive:true});
// Copy only Git-tracked public project files; never copy .state, .env, node_modules or local receipts.
for(const file of execFileSync('git',['ls-files','-z'],{encoding:'utf8'}).split('\0').filter(Boolean)){
 if(file.startsWith('.github/')||file.startsWith('.state/')||file.startsWith('submission-receipts/')||file.startsWith('.env')||file==='node_modules'||lstatSync(file).isSymbolicLink())continue;
 const destination=resolve(target,file);if(relative(target,destination).startsWith('..'))throw new Error('Path escapes public staging directory');mkdirSync(dirname(destination),{recursive:true});copyFileSync(file,destination);
}
console.log('Git-tracked public files staged');
