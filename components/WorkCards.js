import { useState } from "react";
import { FiArrowUpRight, FiX } from "react-icons/fi";

export default function WorkCards({ jobs, paused }) {
  const [selected, setSelected] = useState(null);
  return (
    <div className="work-pair reveal">
      {jobs.map((job, i) => (
        <article
          className={`work-card ${selected === i ? "card-open" : ""}`}
          key={job.company}
        >
          <button
            className="work-cover"
            aria-expanded={selected === i}
            aria-controls={`work-details-${i}`}
            onClick={() => setSelected(selected === i ? null : i)}
            onPointerMove={(e) => {
              if (paused || e.pointerType === "touch") return;
              const r = e.currentTarget.getBoundingClientRect();
              e.currentTarget.style.setProperty(
                "--scan",
                `${Math.max(0, Math.min(100, ((e.clientX - r.left) / r.width) * 100))}%`,
              );
            }}
            onPointerLeave={(e) =>
              e.currentTarget.style.setProperty("--scan", "100%")
            }
          >
            <div className="work-code" aria-hidden="true">
              {Array.from({ length: 12 }, (_, n) => (
                <span key={n}>
                  {(i === 0
                    ? [
                        "merchant.identity → verified",
                        "access.roles.resolve(tenant)",
                        'event.publish("lifecycle")',
                        "account.scale = 5_000_000",
                      ][n % 4]
                    : [
                        "service.boot → quarkus",
                        "query.execute(procedure)",
                        "response.time *= 0.60",
                        "cold.start *= 0.40",
                      ][n % 4]
                  )
                    .concat("   /   ")
                    .repeat(4)}
                </span>
              ))}
            </div>
            <div className="work-face">
              <span className="work-date mono">{job.dates}</span>
              <strong className={i === 0 ? "visa-name" : "openreach-name"}>
                {job.company}
              </strong>
              <span className="work-team">{job.team}</span>
              <div className="work-card-bottom">
                <span>{job.role}</span>
                <span className="card-arrow">
                  <FiArrowUpRight />
                </span>
              </div>
            </div>
            <span className="scan-beam" aria-hidden="true" />
          </button>
          <div className="work-caption">
            <p>{job.summary}</p>
            <button
              onClick={() => setSelected(selected === i ? null : i)}
              aria-expanded={selected === i}
              aria-controls={`work-details-${i}`}
            >
              {selected === i ? "Close" : "What I built"}{" "}
              {selected === i ? <FiX /> : <FiArrowUpRight />}
            </button>
          </div>
          <div
            className="work-detail"
            id={`work-details-${i}`}
            hidden={selected !== i}
          >
            <p className="work-stat">
              <strong>{job.metric}</strong> {job.metricDescription}
            </p>
            <ul>
              {job.details.map((d) => (
                <li key={d}>{d}</li>
              ))}
            </ul>
            <p className="mono">{job.technologies.join(" / ")}</p>
          </div>
        </article>
      ))}
    </div>
  );
}
