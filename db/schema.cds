namespace workflow;

using {sap} from '@sap/cds/common';

entity workflow {
  key  id                : UUID;
    definitionId      : String(255);
    definitionVersion : String(10);
    subject           : String(255);
    status            : Association to WorkflowStatus;
    useraction:String(200);
    comments:String(200);
    recipientUsers:String(200);
    startedAt         : Date;
    startedBy         : String(255);
    completedAt       : Date;
    businessKey       : String(255);
    parentInstanceId  : String(36);
    rootInstanceId    : String(36);
    applicationScope  : String(36);
    projectId          : String(255);
    projectVersion    : String(64);
    environmentId     : String(36);
}


entity WorkflowStatus : sap.common.CodeList {
    key code        : String enum {

             R  = 'RUNNING';
            E = 'ERRONEOUS';
            A = 'SUSPENDED';
            X  = 'CANCELED';
            C = 'COMPLETED';
        } default 'RUNNING'; //> will be used for foreign keys as well
        criticality : Integer; //  2: yellow colour,  3: green colour, 1: Red

}
