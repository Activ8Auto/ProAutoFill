"use client";
import React, { useState } from "react";
import DashboardCard from "@/app/(DashboardLayout)/components/shared/DashboardCard";

interface Run {
  id: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  chosen_minutes: number;
  selected_duration: string | null;
  selected_visit_type: string | null;
  details: any;
}

interface Job {
  job_id: string;
  profile_name: string;
  target_minutes: number;
  total_minutes: number;
  status: string;
  runs: Run[];
}

type Props = {
  jobs: Job[];
};

const AutomationJobsList: React.FC<Props> = ({ jobs }) => {
  // Filter out jobs that don’t have a valid job_id.
  const validJobs = jobs.filter((job) => {
    const id = job.job_id ? job.job_id.toLowerCase() : "";
    return id && id !== "unknown" && id !== "old" ;
  });

  // Sort jobs so that the newest ones (by the first run's start_time) are first.
  const sortedJobs = validJobs.sort((a, b) => {
    const aStart =
      a.runs && a.runs[0] && a.runs[0].start_time
        ? new Date(a.runs[0].start_time)
        : new Date(0);
    const bStart =
      b.runs && b.runs[0] && b.runs[0].start_time
        ? new Date(b.runs[0].start_time)
        : new Date(0);
    return bStart.getTime() - aStart.getTime();
  });

  // Track which job_id(s) are expanded.
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const handleToggle = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    if (newExpanded.has(jobId)) {
      newExpanded.delete(jobId);
    } else {
      newExpanded.add(jobId);
    }
    setExpandedJobs(newExpanded);
  };

  return (
    <DashboardCard
      title="Automation Jobs"
      subtitle="Overview of automation job history and status"
    >
      <div style={{ maxHeight: "600px", overflowY: "auto" }}>
        {sortedJobs.length === 0 ? (
          <p>No automation jobs found.</p>
        ) : (
          sortedJobs.map((job, idx) => {
            // Determine if this is the most recent (active) job.
            const isActiveJob = idx === 0;
            // Use the first run's start_time as the job's initiation time.
            const initiatedTime =
              job.runs && job.runs.length > 0 && job.runs[0].start_time
                ? new Date(job.runs[0].start_time)
                : null;
            const formattedInitiatedTime = initiatedTime
              ? initiatedTime.toLocaleString()
              : "Unknown initiation time";

            // For an active job, use the job's target_minutes value.
            // For previous (finished) jobs, we assume they are done and sum up their run times.
            let effectiveTargetMinutes: number;
            let progressDisplay: string;
            if (isActiveJob) {
              effectiveTargetMinutes = job.target_minutes;
              progressDisplay = `${job.total_minutes} / ${job.target_minutes}`;
            } else {
              // Sum up all chosen_minutes from runs for finished jobs.
              const computedTotal = job.runs.reduce(
                (acc, run) => acc + run.chosen_minutes,
                0
              );
              effectiveTargetMinutes = computedTotal;
              // Finished jobs show full progress.
              progressDisplay = `${computedTotal} / ${computedTotal}`;
            }
            // Compute hours for display.
            const targetHours = (effectiveTargetMinutes / 60).toFixed(1);

            const isExpanded = expandedJobs.has(job.job_id);
            return (
              <div
                key={job.job_id}
                style={{
                  border: "1px solid #ccc",
                  borderRadius: "4px",
                  marginBottom: "10px",
                  padding: "10px",
                }}
              >
                {/* JOB HEADER */}
                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => handleToggle(job.job_id)}
                >
                  <h3 style={{ margin: 0 }}>
                    Job: Initiated on {formattedInitiatedTime} for {targetHours}{" "}
                    hours using Profile {job.profile_name}
                  </h3>
                  <p style={{ margin: 0 }}>
                    Status: {job.status} | Progress: {progressDisplay} minutes
                  </p>
                  <p style={{ margin: "4px 0", color: "#007bff" }}>
                    {isExpanded ? "Hide tasks ▲" : "Show tasks ▼"}
                  </p>
                </div>

                {/* RUNS TABLE (collapsible) */}
                {isExpanded && (
                  <div style={{ marginTop: "10px" }}>
                    <table
                      style={{
                        width: "100%",
                        borderCollapse: "collapse",
                        backgroundColor: "#fafafa",
                      }}
                    >
                      <thead>
                        <tr style={{ backgroundColor: "#eee" }}>
                          <th style={{ padding: "8px", textAlign: "left" }}>
                            Start Time
                          </th>
                          <th style={{ padding: "8px", textAlign: "left" }}>
                            End Time
                          </th>
                          <th style={{ padding: "8px", textAlign: "left" }}>
                            Status
                          </th>
                          <th style={{ padding: "8px", textAlign: "left" }}>
                            Minutes
                          </th>
                          <th style={{ padding: "8px", textAlign: "left" }}>
                            Duration
                          </th>
                          <th style={{ padding: "8px", textAlign: "left" }}>
                            Visit Type
                          </th>
                          <th style={{ padding: "8px", textAlign: "left" }}>
                            Details
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {job.runs.map((run) => (
                          <tr key={run.id}>
                            <td
                              style={{
                                padding: "8px",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              {run.start_time
                                ? new Date(run.start_time).toLocaleString()
                                : "N/A"}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              {run.end_time
                                ? new Date(run.end_time).toLocaleString()
                                : "N/A"}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              {run.status}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              {run.chosen_minutes}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              {run.selected_duration || "N/A"}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              {run.selected_visit_type || "N/A"}
                            </td>
                            <td
                              style={{
                                padding: "8px",
                                borderBottom: "1px solid #ddd",
                              }}
                            >
                              {run.details ? JSON.stringify(run.details) : "N/A"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </DashboardCard>
  );
};

export default AutomationJobsList;
