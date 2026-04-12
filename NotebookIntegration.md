Notebook Integration Guide
Goal
This document is the clean frontend reference for DeltaMeta notebook UI.
It explains:
what is already implemented in backend
what is still a product/UI gap
the recommended user-friendly architecture
the exact frontend API roadmap
the exact status/feed integration flow
a ready-to-use frontend implementation prompt
Relevant backend files:
notebooks/router.py
notifications/router.py
spark_router.py
airflow_router.py
models.py
Current Backend Capabilities
These are already implemented and available for frontend integration.
Notebook authoring and storage
upload notebook file
create notebook directly from editor JSON
fetch notebook metadata
update notebook metadata
fetch notebook content JSON
save notebook content JSON
delete notebook
APIs:
`POST /notebooks/upload`
`POST /notebooks`
`GET /notebooks`
`GET /notebooks/{notebook_id}`
`PUT /notebooks/{notebook_id}`
`GET /notebooks/{notebook_id}/content`
`PUT /notebooks/{notebook_id}/content`
`DELETE /notebooks/{notebook_id}`
Important notebook fields:
`execution_mode`
`single_profile`
`mixed_profile`
`default_execution_profile`
`python`
`pyspark`
`sql_trino`
Product rule:
`single_profile` notebooks are locked to one execution profile
`mixed_profile` notebooks can open sessions in multiple profiles, but they are interactive-only and cannot be used for direct Spark runs or saved Spark jobs
Notebook detail example:
```json
{
  "id": "88ba9559-352f-4e14-8ee1-346844861c86",
  "org_id": "6284b341-cb20-4f00-90d7-759f3cc67061",
  "name": "sales_analysis.ipynb",
  "path": "orgs/org2/notebooks/88ba9559-352f-4e14-8ee1-346844861c86/sales_analysis.ipynb",
  "description": "Exploration notebook for sales",
  "execution_mode": "single_profile",
  "default_execution_profile": "python",
  "is_active": true,
  "created_by": "d6529dc7-3e38-4c67-b455-e4d6d8d1303f",
  "created_at": "2026-04-12T05:40:00.000000Z",
  "updated_at": "2026-04-12T05:45:00.000000Z"
}
```
Mixed-profile notebook detail example:
```json
{
  "id": "eb9b4b6b-d3fc-4021-9a6d-099e683c596a",
  "org_id": "6284b341-cb20-4f00-90d7-759f3cc67061",
  "name": "exploration_lab.ipynb",
  "path": "orgs/org2/notebooks/eb9b4b6b-d3fc-4021-9a6d-099e683c596a/exploration_lab.ipynb",
  "description": "Cross-runtime exploratory notebook",
  "execution_mode": "mixed_profile",
  "default_execution_profile": "python",
  "is_active": true,
  "created_by": "d6529dc7-3e38-4c67-b455-e4d6d8d1303f",
  "created_at": "2026-04-12T05:50:00.000000Z",
  "updated_at": "2026-04-12T05:50:00.000000Z"
}
```
Direct notebook runs
trigger notebook run through Spark submit
list notebook runs
get single notebook run
optional live status refresh from Spark
APIs:
`POST /notebooks/{notebook_id}/run`
`GET /notebooks/{notebook_id}/runs`
`GET /notebooks/{notebook_id}/runs/{run_id}`
Recommended for detail/status tracking:
`GET /notebooks/{notebook_id}/runs?refresh_status=true`
`GET /notebooks/{notebook_id}/runs/{run_id}?refresh_status=true`
Inline execution sessions and outputs
create notebook session
list notebook sessions
get one notebook session
restart session
close session
list cell executions for a session
get one cell execution in detail
execute one cell in the chosen session
APIs:
`POST /notebooks/{notebook_id}/sessions`
`GET /notebooks/{notebook_id}/sessions`
`GET /notebooks/{notebook_id}/sessions/{session_id}`
`POST /notebooks/{notebook_id}/sessions/{session_id}/restart`
`POST /notebooks/{notebook_id}/sessions/{session_id}/close`
`GET /notebooks/{notebook_id}/sessions/{session_id}/executions`
`GET /notebooks/{notebook_id}/sessions/{session_id}/executions/{execution_id}`
`POST /notebooks/{notebook_id}/sessions/{session_id}/execute`
Session example:
```json
{
  "id": "c13fa774-35d8-44d9-b289-2e0fd2ba02d4",
  "notebook_id": "eb9b4b6b-d3fc-4021-9a6d-099e683c596a",
  "org_id": "6284b341-cb20-4f00-90d7-759f3cc67061",
  "triggered_by": "d6529dc7-3e38-4c67-b455-e4d6d8d1303f",
  "execution_profile": "python",
  "status": "active",
  "kernel_state": "ready",
  "session_metadata": {
    "venv_path": "/app/notebook_kernels/org_6284b341-cb20-4f00-90d7-759f3cc67061/notebook_eb9b4b6b-d3fc-4021-9a6d-099e683c596a/venv",
    "last_execution_count": 1,
    "last_execution_status": "success"
  },
  "started_at": "2026-04-12T05:51:00.000000Z",
  "last_activity_at": "2026-04-12T05:52:00.000000Z",
  "closed_at": null,
  "created_at": "2026-04-12T05:51:00.000000Z",
  "updated_at": "2026-04-12T05:52:00.000000Z"
}
```
Cell execution example:
```json
{
  "id": "5e487939-5a6a-4374-b7e1-a0f0cbad9a54",
  "session_id": "c13fa774-35d8-44d9-b289-2e0fd2ba02d4",
  "notebook_id": "eb9b4b6b-d3fc-4021-9a6d-099e683c596a",
  "org_id": "6284b341-cb20-4f00-90d7-759f3cc67061",
  "triggered_by": "d6529dc7-3e38-4c67-b455-e4d6d8d1303f",
  "execution_profile": "python",
  "cell_type": "code",
  "status": "success",
  "execution_count": 1,
  "code": "x = 10\\nx + 1",
  "stdout": null,
  "stderr": null,
  "result_json": 11,
  "error_name": null,
  "error_message": null,
  "traceback": null,
  "extra": {},
  "started_at": "2026-04-12T05:52:00.000000Z",
  "completed_at": "2026-04-12T05:52:01.000000Z",
  "created_at": "2026-04-12T05:52:01.000000Z"
}
```
Spark jobs linked to notebooks
create Spark job from notebook
list linked Spark jobs
get Spark job
update Spark job
delete Spark job
pause Spark job
resume Spark job
APIs:
`POST /notebooks/{notebook_id}/spark-jobs`
`GET /notebooks/{notebook_id}/spark-jobs`
`GET /notebooks/spark-jobs/{spark_job_id}`
`PUT /notebooks/spark-jobs/{spark_job_id}`
`DELETE /notebooks/spark-jobs/{spark_job_id}`
`POST /notebooks/spark-jobs/{spark_job_id}/pause`
`POST /notebooks/spark-jobs/{spark_job_id}/resume`
Spark job runs
trigger Spark job run
list runs
get single run
stop running Spark job
rerun previous Spark job run
optional live status refresh from Spark
APIs:
`POST /notebooks/spark-jobs/{spark_job_id}/runs`
`GET /notebooks/spark-jobs/{spark_job_id}/runs`
`GET /notebooks/spark-jobs/runs/{run_id}`
`POST /notebooks/spark-jobs/runs/{run_id}/stop`
`POST /notebooks/spark-jobs/runs/{run_id}/rerun`
Recommended for detail/status tracking:
`GET /notebooks/spark-jobs/{spark_job_id}/runs?refresh_status=true`
`GET /notebooks/spark-jobs/runs/{run_id}?refresh_status=true`
Notebook schedules
create schedule linked to Spark job
list schedules
get schedule
update schedule
pause schedule
resume schedule
trigger schedule run now
list schedule runs
get schedule run
schedule run callback is already wired from Airflow
APIs:
`POST /notebooks/spark-jobs/{spark_job_id}/schedules`
`GET /notebooks/spark-jobs/{spark_job_id}/schedules`
`GET /notebooks/schedules/{schedule_id}`
`PUT /notebooks/schedules/{schedule_id}`
`POST /notebooks/schedules/{schedule_id}/pause`
`POST /notebooks/schedules/{schedule_id}/resume`
`POST /notebooks/schedules/{schedule_id}/runs`
`GET /notebooks/schedules/{schedule_id}/runs`
`GET /notebooks/schedules/runs/{run_id}`
Recommended for detail/status tracking:
`GET /notebooks/schedules/{schedule_id}/runs?refresh_status=true`
`GET /notebooks/schedules/runs/{run_id}?refresh_status=true`
Notifications / feed / SSE
Backend now publishes notebook-related live events and exposes them through the common notifications layer.
APIs:
`GET /notifications/feed?refresh_status=true`
`GET /notifications/stream`
The feed now includes a `notebooks` section with:
notebook runs
Spark job runs
schedule runs
Existing notebook helpers and pipeline integration
Still available:
`POST /notebooks/{notebook_id}/create-pipeline`
`POST /pipelines/{pipeline_id}/runs`
`GET /pipelines/{pipeline_id}/runs`
`GET /pipelines/runs/{run_id}`
`GET /notebooks/catalog-views/{catalog_view_id}/trino-helper`
`GET /notebooks/catalog-views/{catalog_view_id}/spark-bootstrap`
`POST /notebooks/catalog-views/{catalog_view_id}/query`
Important Product Truths
These are important for frontend to understand.
True pause for a live Spark submission does not exist
Spark standalone supports:
start
status
stop/kill
It does not support a real process-level pause/resume for a running submission.
So UI should behave like this:
running Spark run:
show `Stop`
do not show `Pause`
saved Spark job definition:
show `Pause` and `Resume`
schedule:
show `Pause` and `Resume`
Notebook delete is now a real file/resource delete flow
`DELETE /notebooks/{notebook_id}` now:
removes notebook file from object storage
deactivates linked Spark jobs
disables linked schedules
It will return `409` if active notebook/Spark runs still exist.
Spark job delete is safe
`DELETE /notebooks/spark-jobs/{spark_job_id}`:
deactivates the Spark job
disables linked schedules
returns `409` if active runs still exist
Notebook execution mode is now explicit
Frontend must treat notebook execution mode as a first-class UX choice.
`single_profile`
Use this when the notebook is meant to behave consistently in one runtime:
`python`
`pyspark`
`sql_trino`
UI behavior:
show one selected execution profile badge
do not show profile switching per session
default new session to the notebook’s `default_execution_profile`
allow:
inline execution
save as Spark job
direct notebook Spark run
schedule creation
Recommended use:
production notebooks
Spark job notebooks
Airflow-scheduled notebooks
`mixed_profile`
Use this when the notebook is exploratory and users want separate sessions for:
Python
PySpark
SQL/Trino
UI behavior:
show the notebook as `Mixed Profile`
show profile picker when creating a session
allow multiple session types for the same notebook
do not imply shared variables across profiles
disable:
`Save as Spark Job`
direct notebook Spark run
schedule creation from that notebook
Important behavior:
Python state is shared only with Python sessions
PySpark state is shared only with PySpark sessions
SQL/Trino is its own execution context
variables do not automatically carry from Python to PySpark or SQL/Trino
Recommended use:
ad hoc analysis
exploration
notebooks where users intentionally switch runtimes
Changing execution mode is protected
If active notebook sessions already exist:
changing `execution_mode`
changing `default_execution_profile`
will return `409`.
Frontend should:
prompt user to close active sessions first
then retry the notebook update
What Is Still Missing
Backend foundation is strong now, but these are still product/UI gaps:
full rich notebook editor frontend
notebook version history
log viewer / output viewer UX
artifact browser UX
user-friendly schedule builder experience in frontend
better run timeline/monitoring UX
notebook templates/snippets UX
These are mostly frontend/product gaps now, not backend foundation gaps.
Recommended User-Friendly Architecture
1. Notebook layer
Notebook is the authoring layer.
Users should be able to:
create notebook in DeltaMeta
upload notebook
open notebook
edit notebook
save notebook
run notebook
choose notebook execution mode explicitly
Storage model:
DB stores notebook metadata
object storage stores notebook JSON content
Execution model:
notebook metadata stores `execution_mode`
notebook metadata stores `default_execution_profile`
sessions must respect notebook execution mode
2. Spark job layer
Spark job is a reusable execution definition linked to a notebook.
One notebook can have many Spark jobs.
Examples:
notebook: `sales_analysis`
job: `sales_analysis_daily`
job: `sales_analysis_backfill`
This is the correct place for:
app resource
main class
default args
default Spark properties
enable/disable state
Important rule:
only `single_profile` notebooks should expose `Save as Spark Job`
best supported profile for this is `pyspark`
3. Schedule layer
Schedule is a user-friendly orchestration layer linked to a Spark job.
Users should configure:
schedule name
cron
default conf
enable/disable
Users should not write DAG code.
Recommended architecture:
DeltaMeta stores schedule config
Airflow runs a generic DAG:
`notebook_spark_runner`
DeltaMeta passes schedule/job/notebook context through DAG conf
4. Live tracking layer
Use both:
feed for initial screen state
SSE for live updates
Recommended frontend pattern:
initial page load:
`GET /notifications/feed?refresh_status=true`
live UI updates:
`GET /notifications/stream`
5. Detail status layer
For run detail pages, use the resource endpoints with `refresh_status=true`.
This gives more reliable detail than only watching the stream.
Recommended Frontend Screens
Screen 1: Notebook List
Show:
notebook name
description
saved path
updated time
quick status badges
Actions:
new notebook
upload notebook
open
run
save as Spark job
delete
Screen 2: Notebook Editor
Show:
notebook content/editor
metadata panel
save button
run button
save as Spark job button
Recommended tabs:
code/content
notebook runs
linked Spark jobs
Screen 3: Spark Jobs Tab
Show:
linked Spark jobs for the notebook
default args
default Spark properties
active/inactive state
Actions:
create Spark job
run
pause
resume
delete
open run history
open schedules
Screen 4: Spark Job Runs
Show:
run status
spark submission id
created/start/end time
error message
Actions:
stop running run
rerun previous run
Screen 5: Schedule Builder / Schedule Detail
Show:
schedule name
cron
enabled/disabled
linked Spark job
recent runs
Actions:
create schedule
edit schedule
pause
resume
run now
Screen 6: Notifications / Activity Panel
Show notebook-related activity from `notifications.feed` and live SSE events.
This should include:
notebook runs
Spark job runs
schedule runs
Frontend API Roadmap
Phase A — Notebook metadata and mode selection
When creating a notebook from the editor:
```http
POST /notebooks
```
Recommended body:
```json
{
  "name": "sales_analysis",
  "description": "Exploration notebook",
  "execution_mode": "single_profile",
  "default_execution_profile": "python",
  "content": {
    "cells": [],
    "metadata": {
      "kernelspec": {
        "display_name": "Python 3",
        "language": "python",
        "name": "python3"
      },
      "language_info": {
        "name": "python"
      }
    },
    "nbformat": 4,
    "nbformat_minor": 5
  }
}
```
Frontend create form should always ask for:
notebook name
description
execution mode
default execution profile
Recommended default:
`execution_mode = single_profile`
`default_execution_profile = python`
For upload flow:
uploaded notebook currently defaults to `single_profile + python`
if user wants mixed-profile or PySpark-first behavior, frontend should call:
`PUT /notebooks/{notebook_id}`
after upload
Phase B — Session creation and inline execution
For `single_profile` notebooks:
do not show a session profile picker
create session automatically using notebook default
For `mixed_profile` notebooks:
show a session profile picker:
Python
PySpark
SQL/Trino
Create session:
```http
POST /notebooks/{notebook_id}/sessions
```
Body for mixed-profile example:
```json
{
  "execution_profile": "pyspark",
  "session_metadata": {}
}
```
If frontend tries to create a non-matching profile on a `single_profile` notebook:
backend returns `409`
Output browsing flow:
use `GET /notebooks/{notebook_id}/sessions/{session_id}/executions` for the session timeline
use `GET /notebooks/{notebook_id}/sessions/{session_id}/executions/{execution_id}` for a focused result drawer or deep-link panel
render from:
`stdout`
`stderr`
`result_json`
`error_name`
`error_message`
`traceback`
Phase C — Spark orchestration UX
Only enable these actions when:
`execution_mode == single_profile`
Show strongest recommendation when:
`default_execution_profile == pyspark`
Disable with tooltip when:
`execution_mode == mixed_profile`
Tooltip:
`Mixed-profile notebooks are interactive only. Create a single-profile notebook, ideally PySpark, for Spark jobs and Airflow schedules.`
Phase 1: Notebook authoring
List notebooks
```http
GET /notebooks
```
Create notebook from editor
```http
POST /notebooks
```
Open notebook metadata
```http
GET /notebooks/{notebook_id}
```
Load notebook content
```http
GET /notebooks/{notebook_id}/content
```
Save notebook metadata
```http
PUT /notebooks/{notebook_id}
```
Save notebook content
```http
PUT /notebooks/{notebook_id}/content
```
Upload notebook file
```http
POST /notebooks/upload
```
Delete notebook
```http
DELETE /notebooks/{notebook_id}
```
Phase 2: Direct notebook run UI
Trigger notebook run
```http
POST /notebooks/{notebook_id}/run
```
List notebook runs
```http
GET /notebooks/{notebook_id}/runs?refresh_status=true
```
Get notebook run detail
```http
GET /notebooks/{notebook_id}/runs/{run_id}?refresh_status=true
```
Phase 3: Spark jobs
Create Spark job
```http
POST /notebooks/{notebook_id}/spark-jobs
```
List linked Spark jobs
```http
GET /notebooks/{notebook_id}/spark-jobs
```
Get Spark job detail
```http
GET /notebooks/spark-jobs/{spark_job_id}
```
Update Spark job
```http
PUT /notebooks/spark-jobs/{spark_job_id}
```
Pause Spark job
```http
POST /notebooks/spark-jobs/{spark_job_id}/pause
```
Resume Spark job
```http
POST /notebooks/spark-jobs/{spark_job_id}/resume
```
Delete Spark job
```http
DELETE /notebooks/spark-jobs/{spark_job_id}
```
Phase 4: Spark job runs
Trigger Spark job run
```http
POST /notebooks/spark-jobs/{spark_job_id}/runs
```
List Spark job runs
```http
GET /notebooks/spark-jobs/{spark_job_id}/runs?refresh_status=true
```
Get Spark job run detail
```http
GET /notebooks/spark-jobs/runs/{run_id}?refresh_status=true
```
Stop running Spark job
```http
POST /notebooks/spark-jobs/runs/{run_id}/stop
```
Rerun previous Spark job run
```http
POST /notebooks/spark-jobs/runs/{run_id}/rerun
```
Phase 5: Schedules
Create schedule
```http
POST /notebooks/spark-jobs/{spark_job_id}/schedules
```
List schedules
```http
GET /notebooks/spark-jobs/{spark_job_id}/schedules
```
Get schedule
```http
GET /notebooks/schedules/{schedule_id}
```
Update schedule
```http
PUT /notebooks/schedules/{schedule_id}
```
Pause schedule
```http
POST /notebooks/schedules/{schedule_id}/pause
```
Resume schedule
```http
POST /notebooks/schedules/{schedule_id}/resume
```
Run schedule now
```http
POST /notebooks/schedules/{schedule_id}/runs
```
List schedule runs
```http
GET /notebooks/schedules/{schedule_id}/runs?refresh_status=true
```
Get schedule run detail
```http
GET /notebooks/schedules/runs/{run_id}?refresh_status=true
```
Phase 6: Activity feed and live updates
Initial activity load
```http
GET /notifications/feed?refresh_status=true
```
Live updates
```http
GET /notifications/stream
```
Consume the `notebooks` section from the feed and notebook-related event types from SSE.
API Examples
Create notebook from editor
```json
POST /notebooks
{
  "name": "sales_analysis",
  "description": "Notebook created from DeltaMeta editor",
  "content": {
    "cells": [],
    "metadata": {
      "kernelspec": {
        "display_name": "Python 3",
        "language": "python",
        "name": "python3"
      },
      "language_info": {
        "name": "python"
      }
    },
    "nbformat": 4,
    "nbformat_minor": 5
  }
}
```
Create Spark job
```json
POST /notebooks/{notebook_id}/spark-jobs
{
  "name": "sales_analysis_daily_batch",
  "description": "Daily Spark run for sales analysis notebook",
  "app_resource": "local:///opt/spark/jobs/notebook_runner.py",
  "main_class": "com.deltameta.jobs.NotebookRunner",
  "default_app_args": ["--mode", "daily"],
  "default_spark_properties": {
    "spark.app.name": "sales_analysis_daily_batch",
    "spark.executor.memory": "2g"
  }
}
```
Trigger Spark job run
```json
POST /notebooks/spark-jobs/{spark_job_id}/runs
{
  "app_args": ["--date", "2026-04-11"],
  "spark_properties": {
    "spark.executor.instances": "2"
  }
}
```
Create schedule
```json
POST /notebooks/spark-jobs/{spark_job_id}/schedules
{
  "name": "Daily Sales Refresh",
  "description": "Runs every day at 6 AM",
  "schedule_type": "cron",
  "cron_expr": "0 6 * * *",
  "airflow_dag_id": "notebook_spark_runner",
  "default_conf": {
    "owner": "analytics"
  }
}
```
Frontend Agent Prompt
Use this prompt for the frontend implementation agent:
```text
Build the full DeltaMeta Notebook UI using the existing notebook, Spark, schedule, and notifications APIs.

Goal:
- users can create notebooks in DeltaMeta
- users can upload/open/edit/save notebooks
- users can run notebooks
- users can save notebooks as Spark jobs
- users can create and manage schedules
- users can view run history and current status
- users can track notebook activity live through feed and SSE stream
- the UX should be user-friendly, not technical or DAG-code-oriented

Backend API groups to integrate:

1. Notebook authoring
- POST /notebooks
- POST /notebooks/upload
- GET /notebooks
- GET /notebooks/{notebook_id}
- PUT /notebooks/{notebook_id}
- GET /notebooks/{notebook_id}/content
- PUT /notebooks/{notebook_id}/content
- DELETE /notebooks/{notebook_id}

2. Notebook runs
- POST /notebooks/{notebook_id}/run
- GET /notebooks/{notebook_id}/runs?refresh_status=true
- GET /notebooks/{notebook_id}/runs/{run_id}?refresh_status=true

3. Spark jobs
- POST /notebooks/{notebook_id}/spark-jobs
- GET /notebooks/{notebook_id}/spark-jobs
- GET /notebooks/spark-jobs/{spark_job_id}
- PUT /notebooks/spark-jobs/{spark_job_id}
- DELETE /notebooks/spark-jobs/{spark_job_id}
- POST /notebooks/spark-jobs/{spark_job_id}/pause
- POST /notebooks/spark-jobs/{spark_job_id}/resume

4. Spark job runs
- POST /notebooks/spark-jobs/{spark_job_id}/runs
- GET /notebooks/spark-jobs/{spark_job_id}/runs?refresh_status=true
- GET /notebooks/spark-jobs/runs/{run_id}?refresh_status=true
- POST /notebooks/spark-jobs/runs/{run_id}/stop
- POST /notebooks/spark-jobs/runs/{run_id}/rerun

5. Schedules
- POST /notebooks/spark-jobs/{spark_job_id}/schedules
- GET /notebooks/spark-jobs/{spark_job_id}/schedules
- GET /notebooks/schedules/{schedule_id}
- PUT /notebooks/schedules/{schedule_id}
- POST /notebooks/schedules/{schedule_id}/pause
- POST /notebooks/schedules/{schedule_id}/resume
- POST /notebooks/schedules/{schedule_id}/runs
- GET /notebooks/schedules/{schedule_id}/runs?refresh_status=true
- GET /notebooks/schedules/runs/{run_id}?refresh_status=true

6. Live notifications
- GET /notifications/feed?refresh_status=true
- GET /notifications/stream

Build these pages:

A. Notebook List Page
- list notebooks
- show name, description, path, updated time
- show execution mode and default execution profile
- show recent notebook activity from notifications feed
- actions: create, upload, open, run, save as Spark job, delete

B. Notebook Editor Page
- support create new notebook
- support open notebook content
- support save notebook content
- show notebook metadata panel
- show execution mode selector:
  - Single Profile
  - Mixed Profile
- show default execution profile selector:
  - Python
  - PySpark
  - SQL/Trino
- show Run button
- show Save as Spark Job button
- add tabs for runs and linked Spark jobs
- for mixed-profile notebooks:
  - show session profile picker
  - disable Save as Spark Job
  - disable direct notebook Spark run
- for single-profile notebooks:
  - hide session profile picker
  - auto-create sessions in the notebook default profile

C. Spark Jobs Section
- list Spark jobs linked to notebook
- show name, description, default args, default Spark properties, active/inactive state
- actions: run, pause, resume, delete, open run history, open schedules

D. Spark Job Runs Page
- list run history
- show status, spark submission id, start/end times, errors
- actions: stop if running, rerun
- run detail page should refresh status cleanly

E. Schedule Section
- list schedules linked to Spark job
- show name, cron, enabled/disabled, last run, recent runs
- actions: create schedule, edit schedule, run now, pause, resume

F. Notifications / Activity Panel
- integrate SSE stream
- merge notebook events, Spark job events, and schedule events
- show live updates without manual refresh

UX rules:
- make notebook execution mode selection explicit at notebook create/edit time
- default new notebooks to:
  - single_profile
  - python
- for mixed-profile notebooks, explain clearly that runtime state is isolated by profile
- do not imply that Python variables automatically carry into PySpark or SQL/Trino cells
- if backend returns 409 for execution mode change, prompt the user to close active sessions first
- only show Save as Spark Job and schedule creation for single-profile notebooks
- strongly recommend pyspark single-profile notebooks for Spark job and Airflow scheduling flows
- do not expose DAG code editing to end users
- use a friendly schedule builder instead of technical orchestration language
- use Stop for a live Spark run
- do not show Pause for a live Spark submission
- use Pause/Resume only for saved Spark jobs and schedules
- handle 409 conflict errors gracefully when delete is blocked by active runs
- treat notifications feed as the initial state and SSE as the live update layer
- use run detail APIs with refresh_status=true for detail pages

Deliverables:
- full notebook UI flow
- full Spark job management UI
- full schedule management UI
- live notifications integration
- clean loading/error/empty states
- mobile-safe and desktop-friendly layout
```
Short Conclusion
The backend notebook foundation is now strong enough for a real frontend implementation.
Best direction:
notebook authoring layer
Spark job layer
schedule layer through generic Airflow DAG
feed + SSE for live activity
That is the cleanest and most user-friendly notebook architecture for DeltaMeta.