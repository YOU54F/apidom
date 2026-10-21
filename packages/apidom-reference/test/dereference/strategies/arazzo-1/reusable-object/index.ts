import path from 'node:path';
import { assert } from 'chai';
import { toValue } from '@swagger-api/apidom-core';
import { mediaTypes } from '@swagger-api/apidom-ns-arazzo-1';
import { fileURLToPath } from 'node:url';

import { dereference, resolve } from '../../../../../src/index.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootFilePath = path.join(__dirname, 'fixtures', 'components', 'root.json');

describe('dereference', function () {
  context('strategies', function () {
    context('arazzo-1', function () {
      context('Reusable Object', function () {
        specify('should dereference $components references', async function () {
          const actual = await dereference(rootFilePath, {
            parse: { mediaType: mediaTypes.latest('json') },
          });
          const workflow = (toValue((actual as any).api) as any).workflows[0];

          assert.deepEqual(workflow.parameters[0], {
            name: 'token',
            in: 'header',
            value: 'override',
          });
          assert.deepEqual(workflow.parameters[1], { name: 'token', in: 'header', value: 'orig' });
          assert.deepEqual(workflow.steps[0].onSuccess[0], { name: 'done', type: 'end' });
        });

        specify('should resolve with the arazzo-1 strategy', async function () {
          const refSet = await resolve(rootFilePath, {
            parse: { mediaType: mediaTypes.latest('json') },
          });
          assert.isTrue(refSet.has(rootFilePath));
        });

        specify('should not mutate the components', async function () {
          const actual = await dereference(rootFilePath, {
            parse: { mediaType: mediaTypes.latest('json') },
          });
          assert.equal(
            (toValue((actual as any).api) as any).components.parameters.token.value,
            'orig',
          );
        });
      });
    });
  });
});
