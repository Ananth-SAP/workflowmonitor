const cds = require('@sap/cds');
const sortArray = require('sort-array');
class workflowservice extends cds.ApplicationService {
  init() {

    const { workflow, WorkflowStatus } = this.entities;
   this.on("READ",WorkflowStatus, req =>{

      const result = [
        {
          "name": "Canceled",
          "descr": "Canceled",
          "code": "CANCELED",
          "criticality": 2
        },
        {
          "name": "COMPLETED",
          "descr": "Completed",
          "code": "COMPLETED",
          "criticality": 3
        },
        {
          "name": "Error",
          "descr": "Error",
          "code": "ERRONEOUS",
          "criticality": 1
        },
        {
          "name": "Running",
          "descr": "Running",
          "code": "RUNNING",
          "criticality": 2
        },
        {
          "name": "Suspended",
          "descr": "Suspended",
          "code": "SUSPENDED",
          "criticality": 2
        }
      ]
      return result;
    })
    this.on("READ", workflow, async req => {
      // 1. Extract OData query parameters
      var queryString;
      if (req.query.SELECT.from.ref[0].where) {
        queryString = parseExpression(req.query.SELECT.from.ref[0].where);
      }
      else if (req.query.SELECT.where) {
        queryString = parseExpression(req.query.SELECT.where);
      }


     var buildprocesssrv;

      // const queryParams = parseQueryParams(req.query.SELECT);
      //  const queryString = Object.keys(queryParams)
      //   .map((key) => `${key}=${queryParams[key]}`)
      //   .join("&");
      try {
       buildprocesssrv = await cds.connect.to("Workflow");
    } catch (err) {
      req.error(500, 'External API failed: ' + err.message);
    }
      //        const d = await buildprocesssrv.tx(req).get("/v1/workflow-instances");
      //          const builddata = await buildprocesssrv.get("/v1/workflow-instances");
      var customquery;
      var builddata = [];
      if (queryString) {
       
        customquery = `/v1/workflow-instances?` + queryString;
        try {
        builddata = await buildprocesssrv.send({
          method: "GET",
          path: customquery
        });
      }
        catch (err) {
          req.error(500, 'External API failed while calling query: ' + err.message);
        }
      }
      else {
        try {
        builddata = await buildprocesssrv.send({
          method: "GET",
          path: "/v1/workflow-instances"
        });
      }
      catch (err) {
        req.error(500, 'External API failed while calling query: ' + err.message);
      }
      }
      //     const builddata = await buildprocesssrv.send({
      //       method: "GET",
      //       path: "/v1/workflow-instances",
      //       query: customquery
      //     });

      var result = [];
      builddata.forEach(data => {
        var date;
        const stdate = new Date(data.startedAt);
        stdate.toISOString().split("T")[0];
        
        if(data.completedAt)
        {
          const etdate = new Date(data.completedAt);
          date = etdate.toISOString().split("T")[0];
        }
        result.push({
          id: data.id,
          definitionId: data.definitionId,
          subject: data.subject,
          status_code: data.status,
          startedAt: stdate.toISOString().split("T")[0],
          startedBy: data.startedBy,
          completedAt:  date,
          businessKey: data.businessKey,
          parentInstanceId: data.parentInstanceId,
          rootInstanceId: data.rootInstanceId,
          applicationScope: data.applicationScope,
          projectId: data.projectId,
          projectVersion: data.projectVersion,
          environmentId: data.environmentId
        })
      });
      return await Promise.all(
        result.map(async (build) => {
          const log = await buildprocesssrv.get(`/v1/workflow-instances/` + build.id + `/execution-logs`);
          sortArray(log, {
            by: 'id',
            order: 'desc'
          });
          const ls_log = log[0];
          if (build.status_code == "ERRONEOUS") {
            build.comments = log[0].error.message;
          }
          else if (build.status_code == "RUNNING") {
            if (ls_log.type = "USERTASK_CREATED") 
              {
              build.useraction = `Pending in ` + log[0].activityId;
              if (log[0].recipientUsers) {
                log[0].recipientUsers.forEach(user => {
                  if (build.recipientUsers) {
                    build.recipientUsers = build.recipientUsers + ` ` + user;
                  } else {
                    build.recipientUsers = user;
                  }

                });
              }
            }
          }
          build.status = await SELECT.one.from(WorkflowStatus).where({ code: build.status_code });
          return build;
        })
      ).then(function (value) {
        return value;
      });



    })

    function parseQueryParams(select) {
      const filter = {};
      Object.assign(
        filter,
        parseExpression(select.from.ref[0].where),
        parseExpression(select.where)
      );




      const params = {};

      for (const key of Object.keys(filter)) {
        switch (key) {
          case "status":
            params["status"] = filter[key];
            break;
          case "status_code":
            params["status"] = filter[key];
            break;
          case "id":
            params["id"] = filter[key];
            break;
          case "businessKey":
            params["businessKey"] = filter[key];
            break;
          default:
            throw new Error(`Filter by '${key}' is not supported.`);
        }
      }

      return params;
    }

    function extractValue(obj) {
      if (obj.ref)
        if (obj.ref[0] == "status_code") {
          return "status"
        }
        else {
          return obj.ref[0];
        }
      if (obj.val) return obj.val;
      if (obj.func && obj.args) {
        // For `tolower`, just return the value inside (assuming single arg)
        return extractValue(obj.args[0]);
      }
      return null;
    }

    function parseExpression(input) {
      const params = {};

      for (let i = 0; i < input.length; i++) {
        const item = input[i];

        if (item.xpr) {
          const xpr = item.xpr;
          let values = [];
          let field = null;

          for (let j = 0; j < xpr.length; j += 4) {
            const left = xpr[j];
            const op = xpr[j + 1];
            const right = xpr[j + 2];

            if (left && right && op === "=") {
              const key = extractValue(left);
              const val = extractValue(right);

              field = key;
              values.push(val);
            }
          }

          if (field && values.length) {
            params[field] = values.join(",");
          }
        } else if (
          i + 2 < input.length &&
          typeof input[i + 1] === "string" &&
          input[i + 1] === "="
        ) {
          const left = extractValue(input[i]);
          const right = extractValue(input[i + 2]);
          params[left] = right;
          i += 2; // Skip over the operator and value
        }
      }

      // Build query string
      return Object.entries(params)
        .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
        .join("&");
    }






    // Add base class's handlers. Handlers registered above go first.
    return super.init()
  }
}



module.exports = { workflowservice }