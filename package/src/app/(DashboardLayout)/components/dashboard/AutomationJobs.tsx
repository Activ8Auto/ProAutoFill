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
  // 1) Filter out invalid job IDs
  const validJobs = jobs.filter((job) => {
    const id = job.job_id ? job.job_id.toLowerCase() : "";
    return id && id !== "unknown" && id !== "old";
  });

  // 2) Sort newest first by runs[0].start_time
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

  // 3) Local state to track expanded job(s)
  const [expandedJobs, setExpandedJobs] = useState<Set<string>>(new Set());
  const handleToggle = (jobId: string) => {
    const newExpanded = new Set(expandedJobs);
    newExpanded.has(jobId) ? newExpanded.delete(jobId) : newExpanded.add(jobId);
    setExpandedJobs(newExpanded);
  };

  // 4) Pagination
  const ITEMS_PER_PAGE = 4;
  const [currentPage, setCurrentPage] = useState<number>(1);

  const totalPages = Math.ceil(sortedJobs.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const jobsOnThisPage = sortedJobs.slice(startIndex, endIndex);

  // Move to the previous page
  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((prev) => prev - 1);
    }
  };

  // Move to the next page
  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((prev) => prev + 1);
    }
  };

  return (
    <DashboardCard
      title="Automation Jobs"
      subtitle="Overview of automation job history and status"
    >
      {/* Main Container */}
      <div style={{ maxHeight: "600px", overflowY: "auto" }}>
        {jobsOnThisPage.length === 0 ? (
          <p>No automation jobs found.</p>
        ) : (
          jobsOnThisPage.map((job, idx) => {
            // Is this the "first" job on this page? (Used to check "active" job, if you want.)
            const isActiveJob = idx === 0 && currentPage === 1;

            // Determine start time & format
            const initiatedTime =
              job.runs && job.runs.length > 0 && job.runs[0].start_time
                ? new Date(job.runs[0].start_time)
                : null;
            const formattedInitiatedTime = initiatedTime
              ? initiatedTime.toLocaleString()
              : "Unknown initiation time";

            // For an active job, use the job's target_minutes.
            // For previous (finished) jobs, sum up all chosen_minutes.
            let effectiveTargetMinutes: number;
            let progressDisplay: string;
            if (isActiveJob) {
              effectiveTargetMinutes = job.target_minutes;
              progressDisplay = `${job.total_minutes} / ${job.target_minutes}`;
            } else {
              const computedTotal = job.runs.reduce(
                (acc, run) => acc + run.chosen_minutes,
                0
              );
              effectiveTargetMinutes = computedTotal;
              progressDisplay = `${computedTotal} / ${computedTotal}`;
            }
            // Convert to hours for display
            const targetHours = (effectiveTargetMinutes / 60).toFixed(1);

            // Is this job expanded?
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
                              {run.details
                                ? JSON.stringify(run.details)
                                : "N/A"}
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

      {/* 5) Pagination Controls (Next / Prev) */}
      {totalPages > 1 && (
        <div style={{ marginTop: "10px", textAlign: "center" }}>
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            style={{ marginRight: "8px" }}
          >
            Previous
          </button>
          <span>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            style={{ marginLeft: "8px" }}
          >
            Next
          </button>
        </div>
      )}
    </DashboardCard>
  );
};

export default AutomationJobsList;
