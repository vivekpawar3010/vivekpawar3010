import projects from "../data/projects";

export default function Projects() {
  return (
    <section style={{ padding: "2rem 0" }}>
      <h2>Projects</h2>
      <ul style={{ listStyle: "none", padding: 0, display: "grid", gap: "1rem" }}>
        {projects.map((project) => (
          <li
            key={project.name}
            style={{ border: "1px solid #ddd", borderRadius: "12px", padding: "1rem" }}
          >
            <strong>{project.name}</strong>
            <br />
            <a href={project.link} target="_blank" rel="noreferrer">
              View Project
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
