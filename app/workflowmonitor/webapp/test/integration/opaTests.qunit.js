sap.ui.require(
    [
        'sap/fe/test/JourneyRunner',
        'com/workflowmonitor/workflowmonitor/test/integration/FirstJourney',
		'com/workflowmonitor/workflowmonitor/test/integration/pages/workflowList',
		'com/workflowmonitor/workflowmonitor/test/integration/pages/workflowObjectPage'
    ],
    function(JourneyRunner, opaJourney, workflowList, workflowObjectPage) {
        'use strict';
        var JourneyRunner = new JourneyRunner({
            // start index.html in web folder
            launchUrl: sap.ui.require.toUrl('com/workflowmonitor/workflowmonitor') + '/index.html'
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