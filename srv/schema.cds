using {workflow as my} from '../db/schema';


service workflowservice {

    entity workflow 
//    @(restrict: 
//    [ { grant: 'READ', to: 'Workflowmonitor', where: 'subject = $user.workflowname' },
//        ])
    as  projection on my.workflow;

    entity WorkflowStatus as projection on my.WorkflowStatus;

}
