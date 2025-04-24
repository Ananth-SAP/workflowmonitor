sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'workflowmonitor/test/integration/FirstJourney',
		'workflowmonitor/test/integration/pages/workflowList',
		'workflowmonitor/test/integration/pages/workflowObjectPage'
    ],
    function(JourneyRunner, opaJourney, workflowList, workflowObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('workflowmonitor') + '/index.html'
        });

       
        JourneyRunner.run(
            {
                pages: { 
					onTheworkflowList: workflowList,
					onTheworkflowObjectPage: workflowObjectPage
                }
            },
            opaJourney.run
        );
    }
);