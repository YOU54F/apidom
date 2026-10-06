import path from 'node:path';
import { assert } from 'chai';
import { mediaTypes } from '@swagger-api/apidom-ns-arazzo-1';
import { fileURLToPath } from 'node:url';

import { resolve } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFilePath = path.join(__dirname, 'fixtures', 'root.json');
const petstorePath = path.join(__dirname, 'fixtures', 'petstore.json');

describe('resolve', function () {
  context('strategies', function () {
    context('arazzo-1', function () {
      context('Source Description', function () {
        specify('should load the referenced document into the reference set', async function () {
          const refSet = await resolve(rootFilePath, {
            parse: { mediaType: mediaTypes.latest('json') },
          });

          assert.isTrue(refSet.has(rootFilePath));
          assert.isTrue(refSet.has(petstorePath));
        });

        specify(
          'should not load documents when external resolution is disabled',
          async function () {
            const refSet = await resolve(rootFilePath, {
              parse: { mediaType: mediaTypes.latest('json') },
              resolve: { external: false },
            });

            assert.isFalse(refSet.has(petstorePath));
          },
        );
      });
    });
  });
});
