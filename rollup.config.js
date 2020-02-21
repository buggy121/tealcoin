import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';
import html from 'rollup-plugin-bundle-html';
import typescript from 'rollup-plugin-typescript2';
import typescriptCompiler from 'typescript';
import json from '@rollup/plugin-json';
import builtins from 'rollup-plugin-node-builtins';
import globals from 'rollup-plugin-node-globals';

const plugins = [
  html({
    template: 'src/frontend/index.html',
    dest: 'dist/frontend',
    filename: 'index.html'
  }),
  typescript({ typescript: typescriptCompiler }),
  json(),
  commonjs({
    include: 'node_modules/**',
    namedExports: {
      elliptic: ['ec']
    }
  }),
  globals(),
  builtins(),
  resolve()
];

module.exports = {
  input: 'src/frontend/index.ts',
  output: {
    file: 'dist/frontend/index.js',
    sourcemap: true,
    format: 'iife'
  },
  plugins
};
