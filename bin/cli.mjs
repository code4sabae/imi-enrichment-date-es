import { TextProtoReader } from "https://deno.land/std/textproto/mod.ts";
import { BufReader } from "https://deno.land/std/io/bufio.ts";
import { commandLineArgs } from "https://taisukef.github.io/denolib/commandLineArgs.mjs";
import { commandLineUsage } from "https://taisukef.github.io/denolib/commandLineUsage.mjs";

import enrichment from "../IMIEnrichmentDate.mjs";

const optionDefinitions = [{
  name: 'help',
  alias: 'h',
  type: Boolean,
  description: 'このヘルプを表示します'
}, {
  name: 'file',
  alias: 'f',
  type: String,
  defaultOption: true,
  typeLabel: '{underline file}',
  description: '変換対象とする JSON ファイル'
}, {
  name: 'string',
  alias: 's',
  type: String,
  typeLabel: '{underline string}',
  description: '変換対象とする電話番号文字列',
}, {
  name: 'indent',
  alias: 'i',
  type: Number,
  typeLabel: '{underline number}',
  description: '出力する JSON のインデント (default 2)',
  defaultValue: 2
}];

const options = commandLineArgs(optionDefinitions);

if (options.help) {
  const usage = commandLineUsage([{
    header: 'imi-enrichment-date',
    content: '日付型の表記を正規化します'
  }, {
    header: 'オプション',
    optionList: optionDefinitions
  }, {
    header: '実行例',
    content: [{
        desc: 'ヘルプの表示',
        example: '$ deno run -A cli.mjs -h'
      },
      {
        desc: '文字列の処理',
        example: '$ deno run -A cli.mjs -s R2-1-1'
      },
      {
        desc: 'ファイルの処理',
        example: '$ deno run -A cli.mjs input.json'
      },
      {
        desc: '標準入力の処理',
        example: '$ cat input.json | deno run -A cli.mjs'
      }
    ]
  }]);
  console.log(usage)
} else if (options.string) {
  console.log(JSON.stringify(enrichment(options.string), null, options.indent));
} else if (options.file) {
  const input = JSON.parse(Deno.readTextFileSync(options.file));
  console.log(JSON.stringify(enrichment(input), null, options.indent));
} else {
  const r = new TextProtoReader(new BufReader(Deno.stdin));
  let buffer = "";
  for (;;) {
    const line = await r.readLine();
    if (line === null) { break; }
    buffer += line + "\n";
  }
  const input = JSON.parse(buffer);
  console.log(JSON.stringify(enrichment(input), null, options.indent));
}
