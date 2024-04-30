import db from "../../db";

async function getMarkdown(projectId) {
    const sql = `
        SELECT
            json_build_object(
                'project', p.title,
                'completed_items', json_agg(CASE WHEN t.status = 'completed' THEN json_build_object('id', t.id, 'title', t.title) END),
                'pending_items', json_agg(CASE WHEN t.status = 'pending' THEN json_build_object('id', t.id, 'title', t.title) END)
            ) AS project_summary
        FROM
            projects p
        LEFT JOIN
            todos t ON t.project_id = p.id
        WHERE
            p.id = $1
        GROUP BY
            p.id;
    `;
    
    const result = (await db.query(sql, [projectId]))?.rows?.[0]?.project_summary ?? {};
    
    result.completed_items = filterOutFalsyValues(result.completed_items);
    result.pending_items = filterOutFalsyValues(result.pending_items);
    result.completed = result.completed_items.length;
    result.pending = result.pending_items.length;
    
    return generateMarkdown({
        ...result,
        summary: `${result.completed}/${result.pending + result.completed} Todos Completed`
    });
}

function filterOutFalsyValues(arr) {
    return (arr ?? []).filter(Boolean);
}

function generateMarkdown(data) {
    const pending = data.pending_items.map(item => `- [ ] ${item.title}`).join('\n');
    const completed = data.completed_items.map(item => `- [x] ${item.title}`).join('\n');

    return `
# ${data.project}
> **Summary**
> ${data.summary}
## Pending
${pending}

## Completed
${completed}
    `.trim();
}

export { getMarkdown };

