using workflowservice as service from '../../srv/schema';
annotate service.workflow with @(
    UI.FieldGroup #GeneratedGroup : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Label : 'Workflow Name',
                Value : subject,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Status',
                Value : status_code,
                Criticality : status.criticality,
            },
            {
                $Type : 'UI.DataField',
                Value : useraction,
                Label : 'Pending By User',
            },
            {
                $Type : 'UI.DataField',
                Label : 'started At',
                Value : startedAt,
            },
            {
                $Type : 'UI.DataField',
                Label : 'started By',
                Value : startedBy,
            },
            {
                $Type : 'UI.DataField',
                Label : 'completed At',
                Value : completedAt,
            },
            {
                $Type : 'UI.DataField',
                Label : 'business Key',
                Value : businessKey,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Parent Instance Id',
                Value : parentInstanceId,
            },
            {
                $Type : 'UI.DataField',
                Label : 'Root Instance Id',
                Value : rootInstanceId,
            },
            {
                $Type : 'UI.DataField',
                Value : recipientUsers,
                Label : 'Recipient Users',
            },
        ],
    },
    UI.Facets : [
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Project Info',
            ID : 'ProjectInfo',
            Target : '@UI.FieldGroup#ProjectInfo',
        },
        {
            $Type : 'UI.ReferenceFacet',
            ID : 'GeneratedFacet1',
            Label : 'Workflow Information',
            Target : '@UI.FieldGroup#GeneratedGroup',
        },
        {
            $Type : 'UI.ReferenceFacet',
            Label : 'Error Details',
            ID : 'ErrorDetails',
            Target : '@UI.FieldGroup#ErrorDetails',
        },
    ],
    UI.LineItem : [
        {
            $Type : 'UI.DataField',
            Label : 'Workflow Name',
            Value : subject,
        },
        {
            $Type : 'UI.DataField',
            Label : 'Status',
            Value : status_code,
            Criticality : status.criticality,
            CriticalityRepresentation : #WithoutIcon,
        },
        {
            $Type : 'UI.DataField',
            Value : businessKey,
            Label : 'Business Key',
        },
        {
            $Type : 'UI.DataField',
            Value : startedAt,
            Label : 'Started At',
        },
        {
            $Type : 'UI.DataField',
            Value : useraction,
            Label : 'Pending by User',
        },
        {
            $Type : 'UI.DataField',
            Label : 'Comments',
            Value : comments,
        },
        {
            $Type : 'UI.DataField',
            Value : completedAt,
            Label : 'Completed At',
        },
    ],
    UI.SelectionFields : [
        status_code,
        businessKey,
        subject,
    ],
    UI.DeleteHidden : true,
    UI.FieldGroup #ErrorDetails : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : comments,
                Label : 'Reason for Error',
            },
        ],
    },
    UI.HeaderInfo : {
        TypeName : 'Workflow',
        TypeNamePlural : 'Workflows',
        Title : {
            $Type : 'UI.DataField',
            Value : businessKey,
        },
    },
    UI.FieldGroup #ProjectInfo : {
        $Type : 'UI.FieldGroupType',
        Data : [
            {
                $Type : 'UI.DataField',
                Value : definitionId,
                Label : 'Definition Id',
            },
            {
                $Type : 'UI.DataField',
                Value : definitionVersion,
                Label : 'Definition Version',
            },
            {
                $Type : 'UI.DataField',
                Value : projectId,
                Label : 'Project Id',
            },
            {
                $Type : 'UI.DataField',
                Value : projectVersion,
                Label : 'Project Version',
            },
            {
                $Type : 'UI.DataField',
                Value : environmentId,
                Label : 'Environment Id',
            },
        ],
    },
);

annotate service.workflow with {
    status @(
        Common.Label : 'Status Code',
        Common.ValueList : {
            $Type : 'Common.ValueListType',
            CollectionPath : 'WorkflowStatus',
            Parameters : [
                {
                    $Type : 'Common.ValueListParameterInOut',
                    LocalDataProperty : status_code,
                    ValueListProperty : 'code',
                },
            ],
            Label : 'Status',
        },
        Common.ValueListWithFixedValues : true,
        Common.Text : {
            $value : status.descr,
            ![@UI.TextArrangement] : #TextOnly
        },
    )
};

annotate service.workflow with {
    startedAt @Common.Label : 'Started At'
};

annotate service.workflow with {
    businessKey @Common.Label : 'Business Key'
};

annotate service.workflow with {
    comments @UI.MultiLineText : true
};

annotate service.WorkflowStatus with {
    code @Common.Text : {
        $value : descr,
        ![@UI.TextArrangement] : #TextOnly,
    }
};

annotate service.workflow with {
    subject @Common.Label : 'Workflow Name'
};

annotate service.workflow with {
    recipientUsers @UI.MultiLineText : true
};
