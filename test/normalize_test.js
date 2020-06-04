import { describe, it, expect, makeDirname } from "https://taisukef.github.io/denolib/nodelikeassert.mjs"
const __dirname = makeDirname(import.meta.url)

import { normalize } from "../lib/normalize.mjs";
const spec = __dirname + "/../spec";

describe('imi-enrichment-date#normalize', function() {
  describe('spec', () => {
    const json = JSON.parse(Deno.readTextFileSync(`${spec}/002-normalize.json`));
    json.forEach(a => {
      it(a.name, function() {
        expect(normalize(a.input["表記"])).to.equal(a.output["標準型日付"] || null);
      });
    });
  });
});
