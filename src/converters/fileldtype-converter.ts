import {
    FieldType,
    SubTableFieldType,
} from "../kintone/clients/forms-client";
import { objectValues } from "../utils/objectvalues";

type FieldTypesOrSubTableFieldTypes =
    | FieldType[]
    | SubTableFieldType[];
const SIMPLE_VALUE_TYPES = [
    "SINGLE_LINE_TEXT",
    "MULTI_LINE_TEXT",
    "RICH_TEXT",
    "DATE",
    "NUMBER",
    "DATETIME",
    "TIME",
    "CREATED_TIME",
    "UPDATED_TIME",
    "RECORD_NUMBER",
    "DROP_DOWN",
    "LINK",
    "CALC",
    "RADIO_BUTTON",
];

const USER_TYPES = ["CREATOR", "MODIFIER"];

const STRING_LIST_TYPES = ["CHECK_BOX", "MULTI_SELECT"];

const ENTITY_LIST_TYPE = [
    "USER_SELECT",
    "GROUP_SELECT",
    "ORGANIZATION_SELECT",
];

const FILE_TYPE = "FILE";

const SUB_TABLE_TYPE = "SUBTABLE";

export interface FieldTypeGroups {
    simpleFields: FieldType[];
    userFields: FieldType[];
    stringListFields: FieldType[];
    entityListFields: FieldType[];
    fileTypeFields: FieldType[];
    subTableFields: SubTableFieldTypeGroups[];
}

interface SubTableFieldTypeGroups {
    code: string;
    type: string;
    fields: FieldTypeGroups;
}

function excludeLookupOrRelatedRecord(
    field: FieldType | SubTableFieldType
) {
    return Object.keys(field).indexOf("relatedApp") < 0;
}

function selectFieldsTypesIn(
    types: string[],
    fieldsToBeSelected: FieldTypesOrSubTableFieldTypes
): FieldTypesOrSubTableFieldTypes {
    const fields = fieldsToBeSelected as Array<
        FieldType | SubTableFieldType
    >;
    const typeIncludes = fieldToTest =>
        types.indexOf(fieldToTest.type) >= 0;

    return fields
        .filter(typeIncludes)
        .filter(excludeLookupOrRelatedRecord);
}

function selectFieldsTypesEquals(
    type: string,
    fieldsToBeSelected: FieldTypesOrSubTableFieldTypes
): FieldTypesOrSubTableFieldTypes {
    const fields = fieldsToBeSelected as Array<
        FieldType | SubTableFieldType
    >;

    return fields
        .filter(field => field.type === type)
        .filter(excludeLookupOrRelatedRecord);
}

function convertSubTableFields(
    subTableFields: SubTableFieldType[]
): SubTableFieldTypeGroups[] {
    return subTableFields.map(subTableField => {
        return {
            code: subTableField.code,
            type: subTableField.type,
            fields: convertFieldTypesToFieldTypeGroups(
                objectValues(subTableField.fields)
            ),
        };
    });
}

function convertFieldTypesToFieldTypeGroups(
    properties: FieldTypesOrSubTableFieldTypes
): FieldTypeGroups {
    const fieldTypes = objectValues(properties);
    const simpleFields = selectFieldsTypesIn(
        SIMPLE_VALUE_TYPES,
        fieldTypes
    );
    const userFields = selectFieldsTypesIn(
        USER_TYPES,
        fieldTypes
    );
    const stringListFields = selectFieldsTypesIn(
        STRING_LIST_TYPES,
        fieldTypes
    );
    const entityListFields = selectFieldsTypesIn(
        ENTITY_LIST_TYPE,
        fieldTypes
    );
    const fileTypeFields = selectFieldsTypesEquals(
        FILE_TYPE,
        fieldTypes
    );
    const subTableFields = convertSubTableFields(
        selectFieldsTypesEquals(
            SUB_TABLE_TYPE,
            fieldTypes
        ) as SubTableFieldType[]
    );

    return {
        simpleFields,
        entityListFields,
        userFields,
        stringListFields,
        fileTypeFields,
        subTableFields,
    };
}

export const FieldTypeConverter = {
    convertFieldTypesToFieldTypeGroups,
};

export const VisibleForTesting = {
    selectFieldsTypesIn,
    selectFieldsTypesEquals,
    convertSubTableFields,
    constants: {
        STRING_LIST_TYPES,
        FILE_TYPE,
    },
};
