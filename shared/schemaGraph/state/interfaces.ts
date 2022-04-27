export interface SchemaObject {
  name: string;
  is_abstract: boolean;
  from_alias: boolean;
  expr: string | null;
  inherits_from: string[];
  inherited_by: string[];
  constraints: SchemaConstraint[];
  annotations: SchemaAnnotation[];
  properties: SchemaProp[];
  links: SchemaLink[];
}

export type SchemaCardinality = "One" | "Many";

export interface SchemaProp {
  name: string;
  targetName: string;
  required: boolean;
  expr: string | null;
  default: string;
  constraints: SchemaConstraint[];
  annotations: SchemaAnnotation[];
}

export interface SchemaLink {
  name: string;
  targetNames: string[];
  required: boolean;
  cardinality: SchemaCardinality;
  expr: string | null;
  default: string;
  constraints: SchemaConstraint[];
  annotations: SchemaAnnotation[];
  properties: SchemaProp[];
}

export interface SchemaConstraint {
  name: string;
  params: {
    name: string;
    "@value": string;
  }[];
  delegated: boolean;
}

export interface SchemaAnnotation {
  name: string;
  "@value": string;
}

export interface SchemaFunctionParam {
  name: string;
  typeName: string;
  default: string;
  kind: string;
  num: number;
  typemod: string;
}

export interface SchemaFunction {
  id: string;
  name: string;
  params: SchemaFunctionParam[];
  returnTypeName: string;
  returnTypemod: string;
  volatility: string;
  annotations: SchemaAnnotation[];
}

export interface SchemaAbstractConstraint {
  id: string;
  name: string;
  params: SchemaFunctionParam[];
  expr: string | null;
  annotations: SchemaAnnotation[];
}

export interface SchemaScalar {
  id: string;
  name: string;
  extends: string[];
  constraints: SchemaConstraint[];
  enum_values: string[] | null;
  annotations: SchemaAnnotation[];
}
