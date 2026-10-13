// Both typegen read rules are enabled. These requests are compiled only.
import { createClient, type InferMicroCMSContent } from '../../../..';
import type { MainServiceSchema as Schema } from './read-references';
type Assert<T extends true> = T;
type SameShape<A, B> = [A] extends [B] ? [B] extends [A] ? true : false : false;
const client = createClient<Schema>({ serviceDomain: 'fixture', apiKey: 'TYPE_ONLY' });
const queries = { depth: 2, fields: ['mustRef.title', 'mustRefs.title', 'minimumRefs.title', 'mayRef.title', 'mayRefs.title', 'zeroRefs.title'] } as const;
const list = client.getList({ endpoint: 'pages', queries });
type Selected = Awaited<typeof list>['contents'][number];
type Title = { title: string };
type Single = Assert<SameShape<Selected['mustRef'], Title>>;
type Many = Assert<SameShape<Selected['mustRefs'], [Title, ...Title[]]>>;
type Minimum = Assert<SameShape<Selected['minimumRefs'], [Title, ...Title[]]>>;
type OptionalSingle = Assert<SameShape<Selected['mayRef'], Title | null>>;
type OptionalMany = Assert<SameShape<Selected['mayRefs'], Title[]>>;
type Zero = Assert<SameShape<Selected['zeroRefs'], Title[]>>;
type Extracted = Assert<SameShape<Selected, InferMicroCMSContent<Schema, 'pages', typeof queries>>>;
// @ts-expect-error a trusted required reference cannot be null
const missing: Selected['mustRef'] = null;
// @ts-expect-error nested fields selection must preserve nonempty required arrays
const emptyRequired: Selected['mustRefs'] = [];
// @ts-expect-error nested fields selection must preserve minimum-count arrays
const emptyMinimum: Selected['minimumRefs'] = [];
// @ts-expect-error type extraction must preserve the same nonempty array
const emptyExtracted: InferMicroCMSContent<Schema, 'pages', typeof queries>['minimumRefs'] = [];
const optionalNull: Selected['mayRef'] = null;
const optionalEmpty: Selected['mayRefs'] = [];
const zeroEmpty: Selected['zeroRefs'] = [];
const one: Selected['minimumRefs'] = [{ title: 'title' }];
const object = client.getObject({ endpoint: 'settings', queries });
type Object = Awaited<typeof object>;
type ObjectReference = Assert<SameShape<Object['mustRef'], Title>>;
type ObjectMinimum = Assert<SameShape<Object['minimumRefs'], [Title, ...Title[]]>>;
const ids = client.getList({ endpoint: 'pages', queries: { depth: 0, fields: ['mustRef.id', 'minimumRefs.id'] } });
type Ids = Awaited<typeof ids>['contents'][number];
type IdReference = Assert<SameShape<Ids['mustRef'], { id: string }>>;
type IdMinimum = Assert<SameShape<Ids['minimumRefs'], [{ id: string }, ...{ id: string }[]]>>;
const detail = client.getListDetail({ endpoint: 'pages', contentId: 'id', queries });
type DetailMinimum = Assert<SameShape<Awaited<typeof detail>['minimumRefs'], [Title, ...Title[]]>>;
const all = client.getAllContents({ endpoint: 'pages', queries });
type AllMinimum = Assert<SameShape<Awaited<typeof all>[number]['minimumRefs'], [Title, ...Title[]]>>;
const full = client.getListDetail({ endpoint: 'pages', contentId: 'id' });
type Full = Assert<SameShape<Awaited<typeof full>, Schema['pages']['depths'][1]>>;
declare const content: Schema['pages']['create'];
client.create({ endpoint: 'pages', content });
const { minimumRefs: _refs, ...withoutMinimum } = content;
// @ts-expect-error positive-minimum keys remain mandatory in write types
client.create({ endpoint: 'pages', content: withoutMinimum });
client.update({ endpoint: 'pages', contentId: 'id', content: {} });
