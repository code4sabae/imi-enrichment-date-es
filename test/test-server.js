import { describe, it, expect, makeDirname } from "https://taisukef.github.io/denolib/nodelikeassert.mjs"
const __dirname = makeDirname(import.meta.url)
// const spawn = require('child_process').spawn;

const spec = __dirname + "/../spec";

const PORT = "3031" // "37564";
const ENDPOINT = `http://localhost:${PORT}`;

describe('imi-enrichment-date#server', () => {

  /*
  let server = null;
  before(done => {
    server = spawn("deno", ["run", "-A", "bin/server.mjs", PORT]);
    let initialized = false;
    server.stdout.on('data', (data) => {
      if (!initialized) {
        initialized = true;
        done();
      }
    });
  });

  after(() => {
    server.kill();
  });
  */

  describe('server', () => {
    it("GET リクエストに対して 200 OK を返すこと", async () => {
      const res = await fetch(ENDPOINT);
      expect(res.status).to.equal(200);
      expect(res.headers.get("Access-Control-Allow-Origin")).to.equal("*");
      res.body.close();
    });
    
    it("HEAD リクエストを 405 Request Not Allowed でリジェクトすること", async () => {
      const res = await fetch(ENDPOINT, { method: "HEAD" });
      expect(res.status).to.equal(405);
      expect(res.headers.get("Access-Control-Allow-Origin")).to.equal("*");
      res.body.close();
    });

    it("JSON でないリクエストを 400 Bad Request でリジェクトすること", async () => {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: "hello, world",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      expect(res.status).to.equal(400);
      expect(res.headers.get("Access-Control-Allow-Origin")).to.equal("*");
      res.body.close();
    });

    it("正常なリクエストに 200 OK を返すこと", async () => {
      const res = await fetch(ENDPOINT, {
        method: "POST",
        body: "{}",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      });
      expect(res.status).to.equal(200);
      expect(res.headers.get("Access-Control-Allow-Origin")).to.equal("*");
      res.body.close();
    });
  });

  describe("spec", function() {
    const ifiles = Deno.readDirSync(spec);
    const files = [];
    for (const f of ifiles) { files.push(f); }
    files.filter(file => file.name.match(/json$/)).forEach(file => {
      describe(file.name, function() {
        const json = JSON.parse(Deno.readTextFileSync(`${spec}/${file.name}`));
        json.forEach(a => {
          it(a.name, async () => {
            const body = typeof a.input === 'object' ? JSON.stringify(a.input) : a.input;

            const res = await fetch(ENDPOINT, {
              method: "POST",
              body: body,
              headers: {
                'Accept': 'application/json',
                'Content-Type': typeof a.input === 'object' ? 'application/json' : 'text/plain'
              }
            });
            const json = await res.json();
            expect(json).deep.equal(a.output);
          });
        });
      });
    });
  });
});
