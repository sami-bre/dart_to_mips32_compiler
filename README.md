## Dart to MIPS-32 compiler
A tiny compiler that can compile simple dart code into MIPS-32 assembly, written in typescript

This project is under development.

The compiler is being written in the `src/compiler.ts` file
We have tests for parts of the compiler in the `test.ts` file. It's recommended that we write a test as soon as we add a feature in order to test the new feature.

## dev-tips
Manual compilation from typescript to javascript is tedious. Instead, do `npm run live-compile` This script is defined in the `package.json` file.
