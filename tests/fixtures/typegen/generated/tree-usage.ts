
import { createClient, type InferMicroCMSContent } from '../../../..';
import type { TreeServiceSchema } from './tree';
type Assert<T extends true> = T;
type Equal<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false;
type Parent<Value> = Value extends { parent: infer P } ? NonNullable<P> : never;
type Nodes<Depth extends 0 | 1 | 2 | 3> = TreeServiceSchema['nodes']['depths'][Depth];
type Depth0 = Assert<Equal<Parent<Nodes<0>>, { id: string }>>;
type Depth1 = Assert<Equal<Parent<Nodes<1>>, Nodes<0>>>;
type Depth2 = Assert<Equal<Parent<Parent<Nodes<2>>>, Nodes<0>>>;
type Depth3 = Assert<Equal<Parent<Parent<Parent<Nodes<3>>>>, Nodes<0>>>;
type Cutoff3 = Assert<Equal<Parent<Parent<Parent<Parent<Nodes<3>>>>>, { id: string }>>;
type MultiReference = Assert<Equal<Nodes<0>['children'][number], { id: string }>>;
type MultiReference3 = Assert<Equal<Nodes<3>['children'][number], Nodes<2>>>;
type Custom0 = Assert<Equal<NonNullable<NonNullable<Nodes<0>['custom']>['target']>, { id: string }>>;
type Custom2 = Assert<Equal<NonNullable<NonNullable<Nodes<2>['custom']>['target']>, Nodes<1>>>;
type Repeat2 = Assert<Equal<NonNullable<NonNullable<Nodes<2>['blocks']>[number]['target']>, Nodes<1>>>;
const client = createClient<TreeServiceSchema>({ serviceDomain: 'fixture', apiKey: 'TYPE_ONLY' });
const selected = client.getList({ endpoint: 'nodes', queries: { depth: 3, fields: ['parent.parent.parent.title'] } });
type Selected = Assert<Equal<Awaited<typeof selected>['contents'][number], { parent: { parent: { parent: { title?: string | null } | null } | null } | null }>>;
const cutoff = client.getList({ endpoint: 'nodes', queries: { depth: 3, fields: ['parent.parent.parent.parent.id'] } });
type CutoffSelection = Assert<Equal<Awaited<typeof cutoff>['contents'][number], { parent: { parent: { parent: { parent: { id: string } | null } | null } | null } | null }>>;
const defaultResponse = client.getList({ endpoint: 'nodes' });
type Default = Assert<Equal<Awaited<typeof defaultResponse>['contents'][number], Nodes<1>>>;
const constQueries = { fields: ['id', 'title'], ids: ['fixture'] } as const;
const constSelection = client.getList({ endpoint: 'nodes', queries: constQueries });
type ConstSelection = Assert<Equal<Awaited<typeof constSelection>['contents'][number], Pick<Nodes<1>, 'id' | 'title'>>>;
declare const request:
  | { endpoint: 'nodes'; queries: { depth: 2 } }
  | { endpoint: 'nodes' };
const unionResponse = client.getList(request);
type RequestUnion = Assert<Equal<Awaited<typeof unionResponse>['contents'][number], Nodes<1> | Nodes<2>>>;
// @ts-expect-error the default-depth branch only guarantees id at parent.parent
unionResponse.then(response => response.contents[0].parent?.parent?.createdAt);
const object = client.getObject({ endpoint: 'settings', queries: { depth: 2, fields: ['featured.parent.title'] } });
type ObjectNoId = Assert<Equal<'id' extends keyof Awaited<typeof object> ? true : false, false>>;
// @ts-expect-error a depth-1 parent.parent only has id
client.getList({ endpoint: 'nodes', queries: { depth: 1, fields: ['parent.parent.title'] } });
// @ts-expect-error the fourth reference at depth 3 only has id
client.getList({ endpoint: 'nodes', queries: { depth: 3, fields: ['parent.parent.parent.parent.title'] } });
// @ts-expect-error custom subfield projections are outside the supported field paths
client.getList({ endpoint: 'nodes', queries: { fields: ['custom.target.title'] } });
const extracted: InferMicroCMSContent<TreeServiceSchema, 'nodes', { depth: 0; fields: readonly ['parent.id'] }> = { parent: { id: 'fixture' } };
void extracted;
