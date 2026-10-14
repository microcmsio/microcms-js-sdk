// Generated fixtures come from the captured required-field schema in typegen.
// These calls are compiled only; no Content API requests are executed.
import { createClient, type InferMicroCMSContent } from '../../../..';
import type { MainServiceSchema } from './required';
import type { MainServiceSchema as StrictSchema } from './required-strict';

type Assert<T extends true> = T;
type Equal<A, B> = (<T>() => T extends A ? 1 : 2) extends (<T>() => T extends B ? 1 : 2) ? true : false;
const client = createClient<MainServiceSchema>({ serviceDomain: 'fixture', apiKey: 'TYPE_ONLY' });
const strict = createClient<StrictSchema>({ serviceDomain: 'fixture', apiKey: 'TYPE_ONLY' });
const endpoint = 'typegen_matrix_required';
type Create = MainServiceSchema[typeof endpoint]['create'];
type Update = MainServiceSchema[typeof endpoint]['update'];
const leaf = { fieldId: 'leaf', text: 'child' } as const;
const row: Create['details'] = { fieldId: 'row', label: 'row', amount: 0, children: [leaf] };
const content: Create = { title: 'required', count: 0, enabled: false, details: row, blocks: [row] };
client.create({ endpoint, content });
client.update({ endpoint, contentId: 'id', content: { title: 'updated' } });
client.update({ endpoint, contentId: 'id', content: {} });
client.update({ endpoint, contentId: 'id', content: { details: row, blocks: [row] } });
client.update({ endpoint, contentId: 'id', content: { optionalDetails: {} } });
// @ts-expect-error required fields are checked by the SDK
client.create({ endpoint, content: {} });
const { enabled: _enabled, ...withoutBoolean } = content;
// @ts-expect-error API may default to false, but the schema write policy requires it
client.create({ endpoint, content: withoutBoolean });
// @ts-expect-error top-level empty required custom objects are rejected
client.update({ endpoint, contentId: 'id', content: { details: {} } });
// @ts-expect-error a supplied optional custom field still requires its children
client.update({ endpoint, contentId: 'id', content: { optionalDetails: { fieldId: 'row', label: 'partial' } } });
// @ts-expect-error replacement repeater elements need all their required children
client.update({ endpoint, contentId: 'id', content: { blocks: [{ fieldId: 'row', label: 'partial' }] } });
// @ts-expect-error the nonempty tuple constraint is retained by SDK inference
client.update({ endpoint, contentId: 'id', content: { blocks: [] } });
// @ts-expect-error nested nonempty tuples are also retained
client.update({ endpoint, contentId: 'id', content: { details: { fieldId: 'row', label: 'row', amount: 0, children: [] } } });
declare const uncertainBlocks: NonNullable<Update['blocks']>[number][];
// @ts-expect-error separating content into a variable does not bypass nonempty constraints
client.update({ endpoint, contentId: 'id', content: { blocks: uncertainBlocks } });

const normal = client.getList({ endpoint, queries: { fields: ['title', 'details'] } });
type NormalTitle = Assert<Equal<Awaited<typeof normal>['contents'][number]['title'], string | null | undefined>>;
const queries = { depth: 2, fields: ['id', 'title', 'details'] } as const;
const narrowed = strict.getList({ endpoint, queries });
type Selected = Awaited<typeof narrowed>['contents'][number];
type RequiredTitle = Assert<Equal<Selected['title'], string>>;
type RequiredLabel = Assert<Equal<Selected['details']['label'], string>>;
type Extracted = Assert<Equal<InferMicroCMSContent<StrictSchema, typeof endpoint, typeof queries>, Selected>>;
const detail = strict.getListDetail({ endpoint, contentId: 'id' });
type Detail = Assert<Equal<Awaited<typeof detail>, StrictSchema[typeof endpoint]['depths'][1]>>;
const all = strict.getAllContents({ endpoint });
type All = Assert<Equal<Awaited<typeof all>[number], Awaited<typeof detail>>>;
