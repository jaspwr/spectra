// This has been adapted from https://github.com/zeokku/glsl.app

import { editor, languages } from "monaco-editor";

export const glslDictionary = {
  keywords: [
    "uniform",
    "varying",
    "attribute",
    "const",
    "break",
    "continue",
    "do",
    "for",
    "while",
    "if",
    "else",
    "switch",
    "case",
    "default",
    "in",
    "out",
    "inout",
    "true",
    "false",
    "invariant",
    "discard",
    "return",
    "struct",
    "precision",
    "highp",
    "mediump",
    "lowp",
    "layout",
    "centroid",
    "flat",
    "smooth",
  ],

  builtinFunctions: [],

  builtinVars: [],

  pseudoTypeKeywords: [
    "genType",
    "genIType",
    "genUType",
    "genBType",
    "vec",
    "ivec",
    "uvec",
    "bvec",
    "mat",
    "gvec",
    "gvec4",
    "gSampler2D",
    "gsampler2D",
    "gSampler3D",
    "gsampler3D",
    "sampler2DShadow",
    "gsampler2DArray",
    "sampler2DArrayShadow",
    "gsamplerCube",
    "samplerCubeShadow",
  ],
  typeKeywords: [
    "bool",
    "bvec2",
    "bvec3",
    "bvec4",

    "int",
    "ivec2",
    "ivec3",
    "ivec4",

    "mat2",
    "mat2x2",
    "mat2x3",
    "mat2x4",
    "mat3",
    "mat3x2",
    "mat3x3",
    "mat3x4",
    "mat4",
    "mat4x2",
    "mat4x3",
    "mat4x4",

    "sampler2D",
    "sampler3D",
    "samplerCube",
    "sampler2DShadow",
    "samplerCubeShadow",
    "sampler2DArray",
    "sampler2DArrayShadow",
    "isampler2D",
    "isampler3D",
    "isamplerCube",
    "isampler2DArray",
    "usampler2D",
    "usampler3D",
    "usamplerCube",
    "usampler2DArray",

    "uint",
    "uvec2",
    "uvec3",
    "uvec4",

    "float",
    "vec2",
    "vec3",
    "vec4",
    "void",
  ],
  uniforms: [],
};

editor.defineTheme("glsl-theme", {
  base: "vs-dark",
  inherit: true,
  rules: [
    // { token: "keyword", foreground: "569CD6" },

    // { token: "identifier", foreground: "d4d4d4" },
    // { token: "identifier.field", foreground: "c8c8c8", fontStyle: "italic" },
    // { token: "identifier.builtin", foreground: "81C784", fontStyle: "underline" },
    // { token: "identifier.uniform", fontStyle: "bold" },
    // { token: "identifier.out", fontStyle: "underline" },
    //
    // { token: "function", foreground: "94cddc", fontStyle: "italic" },
    // { token: "function.builtin", foreground: "ff9f12", fontStyle: "italic" },
    // { token: "function.main", fontStyle: "bold underline" },
    //
    // { token: "type", foreground: "4EC9B0" },
    // { token: "type.struct", fontStyle: "bold italic" },
    //
    { token: "directive", foreground: "c27ba0", fontStyle: "bold" },
    { token: "directive.defined", fontStyle: "italic" },
    { token: "directive.macro", foreground: "729F9D" },
    //
    // { token: "comment", foreground: "6A9955", fontStyle: "italic" },
    // { token: "comment.todo", foreground: "FF6E40", fontStyle: "bold italic" },
    // { token: "comment.note", foreground: "EC407A", fontStyle: "bold italic" },
  ],
  colors: {
    "editor.background": "#00000000",
    "editorBracketHighlight.unexpectedBracket.foreground": "#F44747",
  },
});

languages.register({ id: "glsl" });
languages.setLanguageConfiguration("glsl", {
  wordPattern:
    /(-?(?:(?:\d+\.\d*|\.\d+)(?:[eE][+-]?\d+)?|\d+[eE][+-]?\d+)[fF]?)|([^\`\~\!\@\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
  comments: {
    lineComment: "//",
    blockComment: ["/*", "*/"],
  },
  brackets: [
    ["{", "}"],
    ["[", "]"],
    ["(", ")"],
  ],
  folding: {
    markers: {
      start: /^ *# *pragma +region\b/,
      end: /^ *# *pragma +endregion\b/,
    },
  },
});

languages.setMonarchTokensProvider("glsl", {
  ...glslDictionary,

  operators: [
    "=",
    ">",
    "<",
    "!",
    "~",
    "?",
    ":",
    "==",
    "<=",
    ">=",
    "!=",
    "&&",
    "||",
    "++",
    "--",
    "+",
    "-",
    "*",
    "/",
    "&",
    "|",
    "^",
    "%",
    "<<",
    ">>",
    ">>>",
    "+=",
    "-=",
    "*=",
    "/=",
    "&=",
    "|=",
    "^=",
    "%=",
    "<<=",
    ">>=",
    ">>>=",
  ],

  tokenizer: {
    root: [
      [/\bmain\b/, "function.main"],

      [
        /[a-zA-Z_]\w*/,
        {
          cases: {
            "@keywords": "keyword",
            "@typeKeywords": "type",
            "@builtinFunctions": "function.builtin",
            "@builtinVars": "identifier.builtin",
            "@uniforms": "identifier.uniform",
            "@default": "identifier",
          },
        },
      ],

      [/^ *# */, "directive", "@directive"],

      { include: "@whitespace" },

      { include: "@numbers" },

      [/(\.)([a-zA-Z_]\w*)/, ["operator", "identifier.field"]],

      [/[{}()\[\]]/, "@brackets"],

      { include: "@symbols" },

      [/[;,.]/, "delimiter"],
    ],

    numbers: [
      [/(?:(?:\d+\.\d*|\.\d+)(?:[eE][+-]?\d+)?|\d+[eE][+-]?\d+)[fF]?/, "number.float"],
      [/0[xX][0-9a-fA-F]+[uU]?/, "number.hex"],
      [/0[0-7]+[uU]?/, "number.octal"],
      [/\d+[uU]?/, "number"],
    ],

    symbols: [
      [
        /[=><!~?:&|+\-*\/\^%]+/,
        {
          cases: {
            "@operators": "operator",
            "@default": "",
          },
        },
      ],
    ],

    commentDecorators: [
      [/ *\u0040todo/i, "comment.todo"],
      [/ *\u0040note/i, "comment.note"],
    ],

    blockComment: [
      { include: "@commentDecorators" },

      [/[^\/*]+/, "comment"],
      [/\/\*/, "comment", "@push"],
      [/\*\//, "comment", "@pop"],
      [/[\/*]/, "comment"],
    ],

    lineComment: [
      [/^/, "@rematch", "@pop"],

      { include: "@commentDecorators" },

      [/.*/, "comment"],
    ],

    whitespace: [
      [/\s+/, "white"],
      [/\/\*/, "comment", "@blockComment"],
      [/\/\//, "comment", "@lineComment"],
    ],

    defineDirective: [
      [/^/, "@rematch", "@popall"],

      ["defined", "directive.defined"],

      { include: "@whitespace" },

      { include: "@symbols" },

      { include: "@numbers" },

      [/\w+/, "directive.macro"],
    ],

    directive: [
      [/^/, "@rematch", "@pop"],

      [/define|undef|if(?:n?def)?|elif/, "directive", "@defineDirective"],

      [/\b((?:end)?region)( +)(.+)/, ["directive", "whitespace", "string"]],

      [/\b(?:es)\b/, "string"],

      { include: "@numbers" },
      { include: "@whitespace" },

      [/\w+/, "directive"],

      [/"|</, { token: "string.quote", bracket: "@open", next: "@string" }],
    ],

    string: [
      [/[^">]+/, "string"],
      [/"|>/, { token: "string.quote", bracket: "@close", next: "@pop" }],
    ],
  },
});
