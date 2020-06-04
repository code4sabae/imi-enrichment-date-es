import { describe, it, expect, before, after, makeDirname } from "https://taisukef.github.io/denolib/nodelikeassert.mjs"
const __dirname = makeDirname(import.meta.url)
// const spawn = require('child_process').spawn;
const spec = __dirname + "/../spec";

const cli = function (options, stdin) {
  const reader = stdin || Deno.stdin;
  console.log('stdin', stdin);
  const cmd = ["../bin/cli.mjs"].concat(options || []);
  return new Promise(async (resolve, reject) => {
    const args = ["deno", "run", "-A", ...cmd]
    try {
      const process = await Deno.run({ cmd: args, stdout: "piped", stdin: "piped" });
      console.log(args);
      //await Deno.copy(reader, process.stdout);
      console.log(process)
      await process.stdin.write(new TextEncoder().encode(stdin));
      const res = await Deno.readAll(process.stdout);
      console.log(res);
      const txt = new TextDecoder().decode(res);
      console.log(txt);
      resolve(txt);
    } catch (e) {
      console.log(e);
      reject(e);
    }
  });
}

const input = {
  "@type": "日付型",
  "表記": "令和二年1月３１日"
};
const expected = {
  "@type": "日付型",
  "表記": "令和二年1月３１日",
  "標準型日付": "2020-01-31"
};

describe('imi-enrichment-date#cli', () => {

  const tempfile = `tmp.${(new Date()).getTime()}.json`;

  before((done) => {
    Deno.writeTextFileSync(tempfile, JSON.stringify(input));
    done();
  });

  after(() => {
    Deno.unlinkSync(tempfile);
  });

  /*
  describe('options', () => {

    it("-h", async () => {
      const res = cli(["-h"]);
      expect(res).to.have.string("imi-enrichment-date");
    });

    it("--help", (done) => {
      cli(["--help"]).then(res => {
        try {
          expect(res).to.have.string("imi-enrichment-date");
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("-s", (done) => {
      cli(["-s", "R2-1-1"]).then(res => {
        try {
          expect(JSON.parse(res)).deep.equal({
            "@context": "https://imi.go.jp/ns/core/context.jsonld",
            "@type": "日付型",
            "表記": "R2-1-1",
            "標準型日付": "2020-01-01"
          });
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("--string", (done) => {
      cli(["--string", "R2-1-1"]).then(res => {
        try {
          expect(JSON.parse(res)).deep.equal({
            "@context": "https://imi.go.jp/ns/core/context.jsonld",
            "@type": "日付型",
            "表記": "R2-1-1",
            "標準型日付": "2020-01-01"
          });
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("-f", (done) => {
      cli(["-f", tempfile]).then(res => {
        try {
          expect(JSON.parse(res)).deep.equal(expected);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("--file", (done) => {
      cli(["--file", tempfile]).then(res => {
        try {
          expect(JSON.parse(res)).deep.equal(expected);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("filename only", (done) => {
      cli([tempfile]).then(res => {
        try {
          expect(JSON.parse(res)).deep.equal(expected);
          done();
        } catch (e) {
          done(e);
        }
      });
    });

    it("stdin", (done) => {
      cli(null, JSON.stringify(input)).then(res => {
        try {
          expect(JSON.parse(res)).deep.equal(expected);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
  */
  describe("spec", function() {
    const ifiles = Deno.readDirSync(spec);
    const files = [];
    for (const f of ifiles) { files.push(f); }
    files.filter(file => file.name.match(/json$/)).forEach(file => {
      describe(file.name, function() {
        const json = JSON.parse(Deno.readTextFileSync(`${spec}/${file.name}`));
        json.forEach(a => {
          it(a.name, async () => {
            const promise = typeof a.input === 'string' ? cli(["-s", a.input]) : cli(null, JSON.stringify(a.input));
            const res = await promise;
            console.log(a.input);
            console.log(JSON.stringify(JSON.parse(res)) === JSON.stringify(a.output));
            expect(JSON.parse(res)).deep.equal(a.output);
          });
        });
      });
    });
  });

});
