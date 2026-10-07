# ApiDOM Language Service (apidom-ls)

The ApiDOM Language Service (apidom-ls) contains the language smarts powering ApiDOM supported languages processing, specifically editing experience.

ApiDOM Language Service APIs adhere to [LSP Protocol](https://microsoft.github.io/language-server-protocol/) and are therefore usable via a LSP Server wrapper in a variety of editors and IDEs.

## Installation

After [prerequisites](https://github.com/swagger-api/apidom/blob/main/README.md#prerequisites) for installing this package are satisfied, you can install it
via [npm CLI](https://docs.npmjs.com/cli) by running the following command:

```sh
 $ npm install @swagger-api/apidom-ls
```

## Supported specifications

The ApiDOM Language Service fully supports the following API specifications:

- OpenAPI 2.0
- OpenAPI 3.0.x
- OpenAPI 3.1.0
- AsyncAPI 2.x.y
- AsyncAPI 3.x.y
- Arazzo 1.0.x, 1.1.0 (see [Arazzo](#arazzo))

## Arazzo

Arazzo documents (JSON and YAML) get validation, completion, hover documentation and semantic tokens from the
`arazzo-1` language config (`src/config/arazzo`). Codes are in the `ARAZZO1_*` range of `ApiDOM_LS_Code`
(`9210000`+), one block per Arazzo object (Arazzo Specification, Info, Source Description, Workflow, Step, Parameter,
Request Body, Payload Replacement, Criterion, Success/Failure Action, Reusable, Components, ...).

Highlights:

- Required fields, minimum item counts and field types for every object, with enum checks (`sourceDescriptions[].type`,
  parameter `in`, action `type`, criterion `type`).
- Version gating: 1.1.0-only fields (`$self`, `channelPath`, `action`, `timeout`, `correlationId`,
  `targetSelectorType`) and Selector Objects are reported when the document declares an earlier `arazzo` version.
- A step must name exactly one of `operationId`, `operationPath`, `workflowId` or (1.1.0) `channelPath`.
- Uniqueness (steps, workflows, source names, parameters, actions), id and output-key patterns, `dependsOn` items,
  action `goto`/`end`/`retry` rules, non-negative `retryAfter`/`retryLimit`, and `criterion.context` when `type` is set.
- Cross references inside the document: `goto` and `dependsOn` targets and Reusable `reference` values.
- Runtime expressions (`ARAZZO1_EXPRESSION_*`): `$steps.<id>` must exist in the workflow (error) and
  `.outputs.<name>` must be declared (warning); `$workflows`, `$sourceDescriptions` and `$components` targets must
  exist; `$inputs.<name>` is checked when the workflow declares `inputs.properties`. Embedded `{$...}` expressions and
  criterion conditions are scanned.
- Type lints for polymorphic fields: `parameter.value`, `requestBody.payload`, `criterion.type` (string or Expression
  Type Object) and outputs values (string, or Selector from 1.1).

- Version gating: constructs introduced in 1.1.0 (`$self`, `dependsOn`, `$message.*` expressions, the `querystring`
  parameter location, Selector Objects, the `jsonpointer` expression type and the `rfc9535`, `xpath-31`, `rfc6901`
  Expression Type versions) are reported when the declared `arazzo` version is 1.0.x. An unknown 1.x version
  produces a warning and skips the version-gated lints. The spec sets no severity for an unknown version
  (only that tooling uses `arazzo` to interpret the document and ignores the patch part), hence a warning. A document
  whose `arazzo` value is malformed (`2.0.0`, `latest`, a number) is still detected as Arazzo by shape (an `arazzo`
  key plus `sourceDescriptions` or `workflows`) and gets the same warning; a document without any `arazzo` key is
  not recognised.
- A Selector Object (1.1) requires `type` (the 1.1.0 text marks it REQUIRED). For compatibility, validation infers
  `xpath` when its context is an XML media type or `$request.body` with an explicitly XML `requestBody.contentType`.
  This is a tooling fallback, not an exception stated in the Selector Object specification. An XML destination
  payload does not establish the type of a `$response.body` context, so that Selector still requires `type`.
  Payload replacements may omit `targetSelectorType`: the spec defaults XML targets to XPath and JSON targets
  to JSON Pointer. Neither default requires an explicit type field.
- `components` keys must match `^[a-zA-Z0-9\.\-_]+$`; `action` and `correlationId` are only applicable to AsyncAPI
  steps (`correlationId` only with `action: receive`); a Selector Object missing `context` or `selector` has its own code.

Spec-rule coverage lives in `test/arazzo-spec-rules.ts` (one valid and one invalid case per rule).

### Source checks

Arazzo completion and hover use the same source loader and reference-aware target index as validation. Completion
offers local workflow/step IDs, runtime references (including declared step outputs and workflow inputs), and source
operation/workflow IDs in JSON and YAML. Source operation suggestions and hover show method, path and summary when
available. Unavailable sources are omitted without inventing targets. `referenceOptions.resolve.baseURI` supplies
the base for relative source URLs when the text document's URI is not its real location.

`operationId`, `operationPath`, `channelPath` and `workflowId` (in other Arazzo sources) can be checked against the
documents listed in `sourceDescriptions`. The language service does not fetch anything itself; supply a
`sourceDocuments` provider in the context. It receives `{ name, url, type, documentUri, referencedFrom? }` and returns the document as
JSON/YAML text or an already parsed object (sync or async):

```js
const languageService = getLanguageService({
  sourceDocuments: async ({ url }) => readOrFetch(url),
});
```

Supported forms: `$sourceDescriptions.<name>.<operationId>`, a bare `operationId` when there is a single source,
`operationPath` / `channelPath` as `{$sourceDescriptions.<name>.url}#/json/pointer`, and
`$sourceDescriptions.<name>.<workflowId>` for Arazzo sources. Errors are only reported for a source that was loaded:
with no provider, or when it returns `undefined`, throws or returns unparsable content, nothing is reported for that
source. Covered by `test/arazzo-sources.ts`.

Also checked:

- `$ref`s inside source documents are followed: local fragments (`#/components/pathItems/X`) and relative references,
  including path-item `$ref`s. Relative documents are requested from the provider with the resolved URL (no fragment)
  and `referencedFrom` set to the referring document's URL. When a `$ref` cannot be followed (missing document,
  dangling, too deep or cyclic), nothing is reported for what might be behind it.
- A bare `workflowId` that is not a local workflow but is defined in a loaded Arazzo source is an error: the spec
  requires the `$sourceDescriptions.<name>.<workflowId>` form to avoid ambiguity.
- `querystring` parameters (OpenAPI sources only): a warning when the resolved operation does not define a
  `querystring` parameter or also defines `query` parameters, and when a literal value cannot match the parameter's
  `content` media type (JSON text for form-urlencoded, invalid JSON for a JSON media type). Runtime expressions are
  not judged; nothing is reported when the operation is not resolved.

Not checked: bare `workflowId`s that name a workflow in no loaded source, `$ref`s to documents the provider cannot
supply, and `$dynamicRef`/`$id` based resolution. Reference traversal is capped at 16 levels. Querystring checks
do not evaluate runtime expressions or Selectors, or validate arbitrary media-type encodings. Source checks currently
inspect step targets, not workflow/action targets. Shape detection requires top-level `arazzo` and either
`sourceDescriptions` or `workflows`; missing `arazzo` and documents that cannot be parsed remain undetectable.

## Quick start

### Initializing ApiDOM Language Service

```js
import { getLanguageService } from '@swagger-api/apidom-ls';

const apidomContext = {};
const languageService = getLanguageService(apidomContext);
```

The capabilities of the ApiDOM Language Service can be extended by providing custom configuration.

```ts
import { DocumentLink } from 'vscode-languageserver-types';
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Element, MemberElement, isStringElement } from '@swagger-api/apidom-core';
import { InfoElement } from '@swagger-api/apidom-ns-asyncapi-2';
import { getLanguageService, LinksProvider, config } from '@swagger-api/apidom-ls';
import type {
  LanguageSettings,
  ProviderMode,
  LinksContext,
  LinksProviderResult,
  NamespaceVersion,
} from '@swagger-api/apidom-ls';

// Defining custom Links Provider

class RefLinksProvider implements LinksProvider {
  break(): boolean {
    return false;
  }

  providerMode(): ProviderMode {
    return ProviderMode.REF;
  }

  configure(settings: LanguageSettings): void {}

  async doRefLinks(
    textDocument: TextDocument,
    api: Element,
    currentRefLinks: DocumentLink[],
    linksContext?: LinksContext,
  ): Promise<LinksProviderResult> {
    for (const link of currentRefLinks) {
      if (link.target && link.target.startsWith('https://example.com')) {
        link.target = link.target.replace('example.com', 'github.com');
      }
    }
    return {
      mergeStrategy: MergeStrategy.IGNORE,
      links: [],
    };
  }

  name(): string {
    return 'RefProvider';
  }

  namespaces(): NamespaceVersion[] {
    return [
      {
        namespace: 'asyncapi',
        version: '2.6.0',
      },
    ];
  }
}

// Defining custom validation rules

const metadata = config();
const customMetadata = {
  metadataMaps: metadata.metadataMaps
    ? JSON.parse(JSON.stringify(metadata.metadataMaps))
    : undefined,
  rules: metadata.rules ? JSON.parse(JSON.stringify(metadata.rules)) : undefined,
  tokens: metadata.tokens ? JSON.parse(JSON.stringify(metadata.tokens)) : undefined,
  symbols: metadata.symbols ? JSON.parse(JSON.stringify(metadata.symbols)) : undefined,
  linterFunctions: metadata.linterFunctions,
};

// Defining custom linter functions

const apilintEqualsCustom = (element: Element, expectedValues: string[]) => {
  if (element) {
    if (!isStringElement(element)) {
      return false;
    }

    return expectedValues.includes(toValue(element));
  }

  return true;
};

customMetadata.linterFunctions = {
  asyncapi: {
    apilintEqualsCustom,
  },
};

// Defining custom rules

const camelCaseTitle = {
  name: 'SB-API-052-title',
  description: 'title MUST follow camelCase',
  recommended: true,
  code: 20001,
  source: 'apilint',
  message: 'title MUST follow camelCase',
  given: '$.info.title',
  givenFormat: 'JSONPATH',
  severity: 1,
  linterFunction: 'apilintValueCasing',
  linterParams: ['camel'],
  marker: 'key',
  data: {},
};

const versionEquals = {
  code: 70202,
  source: 'apilint',
  message: 'version must be equal to one of the specified values',
  severity: 1,
  linterFunction: 'apilintEqualsCustom',
  linterParams: ['1.0.0', '2.0.0'],
  given: '$.info.version',
  givenFormat: 'JSONPATH',
  marker: 'value',
  data: {},
};

customMetadata.rules = {
  asyncapi: {
    lint: [camelCaseTitle, versionEquals],
  },
};

// Defining custom refractor plugins

const refractorPlugin = () => () => ({
  visitor: {
    MemberElement(element: MemberElement) {
      if (isStringElement(element.key) && element.key.equals('additionalInfo')) {
        element.value = InfoElement.refract(element.value);
      }
    },
  },
});

// Initializing ApiDOM Language Service with custom configuration

const refLinksProvider = new RefLinksProvider();

const customContext = {
  metadata: customMetadata,
  linksProviders: [refLinksProvider],
  refractorPlugins: {
    'asyncapi-2': [refractorPlugin()],
  },
};

const languageService = getLanguageService(customContext);
```

### Validation

The ApiDOM Language Service can validate the document according to the rules of the given specification and provide a list of detected errors and warnings.

```js
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getLanguageService } from '@swagger-api/apidom-ls';

const apidomContext = {};
const languageService = getLanguageService(apidomContext);

const asyncapiDoc = `asyncapi: 2.6.0
info:
  title: Example API
components:
  schemas:
    Order:
      type: object
      properties:
        id:
          type: integer
          format: int64
          example: 1
        status:
          type: string
          enum: placed
`;

const document = TextDocument.create('foo://bar/file.yaml', 'apidom', 0, asyncapiDoc);

const diagnostics = await languageService.doValidation(document);
```

```json
[
  {
    "range": {
      "start": {
        "line": 0,
        "character": 0
      },
      "end": {
        "line": 0,
        "character": 5
      }
    },
    "message": "should always have a 'channels' section",
    "severity": 1,
    "code": 30102,
    "source": "apilint",
    "data": {
      "quickFix": [
        {
          "message": "add 'channels' section",
          "action": "addChild",
          "snippetYaml": "channels: \n  \n",
          "snippetJson": "\"channels\": {\n  \n  },\n"
        }
      ]
    }
  },
  {
    "range": {
      "start": {
        "line": 1,
        "character": 0
      },
      "end": {
        "line": 1,
        "character": 4
      }
    },
    "message": "should always have a 'version'",
    "severity": 1,
    "code": 70201,
    "source": "apilint",
    "data": {
      "quickFix": [
        {
          "message": "add 'version' field",
          "action": "addChild",
          "snippetYaml": "version: \n  ",
          "snippetJson": "\"version\": \"\",\n    "
        }
      ]
    }
  },
  {
    "range": {
      "start": {
        "line": 14,
        "character": 16
      },
      "end": {
        "line": 14,
        "character": 22
      }
    },
    "message": "enum' value must be an array with unique values",
    "severity": 1,
    "code": 10009,
    "source": "apilint",
    "data": {}
  }
]
```

### Documentation

The ApiDOM Language Service can provide documentation for the symbol at the specified position in the document.

```js
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getLanguageService } from '@swagger-api/apidom-ls';

const apidomContext = {};
const languageService = getLanguageService(apidomContext);

const asyncapiDoc = 'asyncapi: 2.6.0';

const document = TextDocument.create('foo://bar/file.yaml', 'apidom', 0, asyncapiDoc);

const documentation = await languageService.doHover(document, {
  line: 0,
  character: 3,
});
```

```json
{
  "contents": {
    "kind": "markdown",
    "value": "***asyncapi***: **asyncApiVersion**\n\n#### [AsyncAPI Version String](https://www.asyncapi.com/docs/reference/specification/v2.6.0#A2SVersionString)\n\nThe version string signifies the version of the AsyncAPI Specification that the document complies to.\nThe format for this string _must_ be `major`.`minor`.`patch`.  The `patch` _may_ be suffixed by a hyphen and extra alphanumeric characters.\n\\\n\\\nA `major`.`minor` shall be used to designate the AsyncAPI Specification version, and will be considered compatible with the AsyncAPI Specification specified by that `major`.`minor` version.\nThe patch version will not be considered by tooling, making no distinction between `1.0.0` and `1.0.1`.\n\\\n\\\nIn subsequent versions of the AsyncAPI Specification, care will be given such that increments of the `minor` version should not interfere with operations of tooling developed to a lower minor version. Thus a hypothetical `1.1.0` specification should be usable with tooling designed for `1.0.0`."
  },
  "range": {
    "start": {
      "line": 0,
      "character": 0
    },
    "end": {
      "line": 0,
      "character": 8
    }
  }
}
```

### Definition location

The ApiDOM Language Service can find the location of the definition referenced at the specified position in the document.

```js
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position } from 'vscode-languageserver-types';
import { getLanguageService } from '@swagger-api/apidom-ls';

const apidomContext = {};
const languageService = getLanguageService(apidomContext);

const asyncapiDoc = `asyncapi: 2.6.0
channels:
  petstore.inventory.added:
    publish:
      message:
        name: Inventory
        contentType: application/json
        payload:
          "$ref": "#/components/schemas/Inventory"
components:
  schemas:
    Inventory:
      type: object
      additionalProperties:
        type: integer
        format: int64
`;

const document = TextDocument.create('foo://bar/file.yaml', 'apidom', 0, asyncapiDoc);

const position = Position.create(8, 22);

const location = await languageService.doProvideDefinition(document, {
  textDocument: document,
  position,
});
```

```json
{
  "uri": "foo://bar/file.yaml",
  "range": {
    "start": {
      "line": 12,
      "character": 6
    },
    "end": {
      "line": 16,
      "character": 0
    }
  }
}
```

### Definition

The ApiDOM Language Service can retrieve the definition of the reference at the specified position in the document.

```js
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position } from 'vscode-languageserver-types';
import { getLanguageService } from '@swagger-api/apidom-ls';

const apidomContext = {};
const languageService = getLanguageService(apidomContext);

const asyncapiDoc = `asyncapi: 2.6.0
channels:
  petstore.inventory.added:
    publish:
      message:
        name: Inventory
        contentType: application/json
        payload:
          "$ref": "#/components/schemas/Inventory"
components:
  schemas:
    Inventory:
      type: object
      additionalProperties:
        type: integer
        format: int64
`;

const document = TextDocument.create('foo://bar/file.yaml', 'apidom', 0, asyncapiDoc);

const definition = await languageService.doHover(document, {
  line: 8,
  character: 22,
});
```

````json
{
  "contents": {
    "kind": "markdown",
    "value": "***$ref***: **string**\n\n\n\n\n\n```yaml\ntype: object\nadditionalProperties:\n  type: integer\n  format: int64\n\n\n```"
  },
  "range": {
    "start": {
      "line": 8,
      "character": 18
    },
    "end": {
      "line": 8,
      "character": 50
    }
  }
}
````

### Completion

The ApiDOM Language Service can provide context-aware completion suggestions for the specified position in the document.

```js
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position } from 'vscode-languageserver-types';
import { getLanguageService } from '@swagger-api/apidom-ls';

const apidomContext = {};
const languageService = getLanguageService(apidomContext);

const asyncapiDoc = `asyncapi: 2.6.0
info:
  title: Example API
  
`;

const document = TextDocument.create('foo://bar/file.yaml', 'apidom', 0, asyncapiDoc);

const position = Position.create(3, 2);

const completion = await languageService.doCompletion(document, {
  textDocument: document,
  position,
});
```

```json
{
  "items": [
    {
      "label": "version",
      "insertText": "version: '$1'",
      "kind": 14,
      "insertTextFormat": 2,
      "documentation": {
        "kind": "markdown",
        "value": "**REQUIRED.** Provides the version of the application API (not to be confused with the specification version)."
      }
    },
    {
      "label": "description",
      "insertText": "description: $1",
      "kind": 14,
      "insertTextFormat": 2,
      "documentation": {
        "kind": "markdown",
        "value": "A short description of the application. [CommonMark syntax](https://spec.commonmark.org/) can be used for rich text representation."
      }
    },
    {
      "label": "termsOfService",
      "insertText": "termsOfService: $1",
      "kind": 14,
      "insertTextFormat": 2,
      "documentation": {
        "kind": "markdown",
        "value": "A URL to the Terms of Service for the API. This MUST be in the form of an absolute URL."
      }
    },
    {
      "label": "contact",
      "insertText": "contact: \n  $1",
      "kind": 14,
      "insertTextFormat": 2,
      "documentation": {
        "kind": "markdown",
        "value": "[Contact Object](https://www.asyncapi.com/docs/reference/specification/v2.6.0#contactObject)\n\\\n\\\nContact information for the exposed API."
      }
    },
    {
      "label": "license",
      "insertText": "license: \n  $1",
      "kind": 14,
      "insertTextFormat": 2,
      "documentation": {
        "kind": "markdown",
        "value": "[License Object](https://www.asyncapi.com/docs/reference/specification/v2.6.0#licenseObject)\n\\\n\\\nLicense information for the exposed API."
      }
    }
  ],
  "isIncomplete": false
}
```

### Reference completion

The ApiDOM Language Service can suggest possible references that can be inserted at the specified position in the document.

```js
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position } from 'vscode-languageserver-types';
import { getLanguageService } from '@swagger-api/apidom-ls';

const apidomContext = {};
const languageService = getLanguageService(apidomContext);

const asyncapiDoc = `asyncapi: 2.6.0
channels:
  petstore.inventory.added:
    publish:
      message:
        name: Inventory
        contentType: application/json
        payload:
          "$ref": "#/components/schemas/Inventory"
components:
  schemas:
    Inventory:
      type: object
      additionalProperties:
        type: integer
        format: int64
    Category:
      type: object
      properties:
        id:
          type: integer
          format: int64
          example: 1
        name:
          type: string
          example: Dogs
`;

const document = TextDocument.create('foo://bar/file.yaml', 'apidom', 0, asyncapiDoc);

const position = Position.create(8, 22);

const completion = await languageService.doCompletion(document, {
  textDocument: document,
  position,
});
```

```json
{
  "items": [
    {
      "label": "#/components/schemas/Category",
      "insertText": "'#/components/schemas/Category$1'",
      "kind": 18,
      "documentation": "type: object\n      properties:\n        id:\n          type: integer\n          format: int64\n          example: 1\n        name:\n          type: string\n          example: Dogs\n",
      "insertTextFormat": 2,
      "sortText": "a",
      "filterText": "\"#/components/schemas/Inventory\"",
      "textEdit": {
        "range": {
          "start": {
            "line": 8,
            "character": 18
          },
          "end": {
            "line": 8,
            "character": 50
          }
        },
        "newText": "'#/components/schemas/Category$1'"
      }
    },
    {
      "label": "#/components/schemas/Inventory/additionalProperties",
      "insertText": "'#/components/schemas/Inventory/additionalProperties$1'",
      "kind": 18,
      "documentation": "type: integer\n        format: int64",
      "insertTextFormat": 2,
      "sortText": "c",
      "filterText": "\"#/components/schemas/Inventory\"",
      "textEdit": {
        "range": {
          "start": {
            "line": 8,
            "character": 18
          },
          "end": {
            "line": 8,
            "character": 50
          }
        },
        "newText": "'#/components/schemas/Inventory/additionalProperties$1'"
      }
    },
    {
      "label": "#/components/schemas/Category/properties/name",
      "insertText": "'#/components/schemas/Category/properties/name$1'",
      "kind": 18,
      "documentation": "type: string\n          example: Dogs\n",
      "insertTextFormat": 2,
      "sortText": "d",
      "filterText": "\"#/components/schemas/Inventory\"",
      "textEdit": {
        "range": {
          "start": {
            "line": 8,
            "character": 18
          },
          "end": {
            "line": 8,
            "character": 50
          }
        },
        "newText": "'#/components/schemas/Category/properties/name$1'"
      }
    },
    {
      "label": "#/components/schemas/Category/properties/id",
      "insertText": "'#/components/schemas/Category/properties/id$1'",
      "kind": 18,
      "documentation": "type: integer\n          format: int64\n          example: 1",
      "insertTextFormat": 2,
      "sortText": "e",
      "filterText": "\"#/components/schemas/Inventory\"",
      "textEdit": {
        "range": {
          "start": {
            "line": 8,
            "character": 18
          },
          "end": {
            "line": 8,
            "character": 50
          }
        },
        "newText": "'#/components/schemas/Category/properties/id$1'"
      }
    }
  ],
  "isIncomplete": false
}
```

### Semantic Tokens

The ApiDOM Language Service can provide semantic tokens for the document, enabling context-aware syntax highlighting.

```js
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getLanguageService } from '@swagger-api/apidom-ls';

const apidomContext = {};
const languageService = getLanguageService(apidomContext);

const asyncapiDoc = `asyncapi: 2.6.0
components:
  schemas:
    Inventory:
      type: object
      additionalProperties:
        type: integer
        format: int64
`;

const document = TextDocument.create('foo://bar/file.yaml', 'apidom', 0, asyncapiDoc);

const tokens = await languageService.computeSemanticTokens(document);
```

```json
{
  "data": [
    0, 0, 8, 14, 0, 1, 0, 10, 16, 0, 1, 2, 7, 18, 0, 1, 4, 9, 23, 0, 1, 6, 4, 3, 64, 0, 6, 6, 0, 64,
    1, 6, 20, 23, 0, 1, 8, 4, 3, 64, 0, 6, 7, 0, 64, 1, 8, 6, 3, 64, 0, 8, 5, 0, 64
  ]
}
```

### Dereferencing

The ApiDOM Language Service can dereference the document, replacing the references with their actual definitions.

```js
import { TextDocument } from 'vscode-languageserver-textdocument';
import { Position } from 'vscode-languageserver-types';
import { getLanguageService } from '@swagger-api/apidom-ls';

const apidomContext = {};
const languageService = getLanguageService(apidomContext);

const asyncapiDoc = `asyncapi: 2.6.0
channels:
  petstore.inventory.added:
    publish:
      message:
        name: Inventory
        contentType: application/json
        payload:
          "$ref": "#/components/schemas/Inventory"
components:
  schemas:
    Inventory:
      type: object
      additionalProperties:
        type: integer
        format: int64
`;

const document = TextDocument.create('foo://bar/file.yaml', 'apidom', 0, asyncapiDoc);

const dereferenced = await languageService.doDeref(document);
```

```yaml
'asyncapi': '2.6.0'
'channels':
  'petstore.inventory.added':
    'publish':
      'message':
        'name': 'Inventory'
        'contentType': 'application/json'
        'payload':
          'type': 'object'
          'additionalProperties':
            'type': 'integer'
            'format': 'int64'
'components':
  'schemas':
    'Inventory':
      'type': 'object'
      'additionalProperties':
        'type': 'integer'
        'format': 'int64'
```

### JSON Pointer Position

The ApiDOM Language Service can find a position in the document corresponding to the given JSON Pointer.

```js
import { TextDocument } from 'vscode-languageserver-textdocument';
import { getLanguageService } from '@swagger-api/apidom-ls';

const apidomContext = {};
const languageService = getLanguageService(apidomContext);

const asyncapiDoc = `asyncapi: 2.6.0
components:
  schemas:
    Inventory:
      type: object
      additionalProperties:
        type: integer
        format: int64
`;

const document = TextDocument.create('foo://bar/file.yaml', 'apidom', 0, asyncapiDoc);

const jsonPointer = '/components/schemas/Inventory';

const position = await languageService.getJsonPointerPosition(document, jsonPointer);
```

```json
{
  "line": 4,
  "character": 6
}
```
