// GraphViewerPage.tsx
import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import CytoscapeComponent from "react-cytoscapejs";
import cytoscape from "cytoscape";
import coseBilkent from "cytoscape-cose-bilkent";
import cytoscapeQtip from "cytoscape-qtip";
import tippy from "tippy.js";
import cytoscapePopper from "cytoscape-popper";
import clsx from "clsx";

function tippyFactory(ref: any, content: any) {
  var dummyDomEle = document.createElement("div");
  var tip = tippy(dummyDomEle, {
    getReferenceClientRect: ref.getBoundingClientRect,
    trigger: "manual",
    content: content,
    arrow: true,
    placement: "bottom",
    hideOnClick: false,
    sticky: "reference",
    interactive: true,
    appendTo: document.body,
  });
  return tip;
}

cytoscape.use(cytoscapePopper(tippyFactory));
cytoscape.use(coseBilkent);
cytoscape.use(cytoscapeQtip);

interface NodeData {
  id: string;
  label: string;
  description?: string;
}

interface EdgeData {
  source: string;
  target: string;
  label: string;
}

interface DocumentData {
  id: string;
  title: string;
}

const GraphViewerPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { docId } = location.state || {};

  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [activeDocId, setActiveDocId] = useState<string | null>(null);
  const [elements, setElements] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Fetch all documents
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/documents");
        if (!res.ok) throw new Error("Failed to load documents");
        console.log(res);
        if (res.status === 500) {
          throw new Error(
            "Server error while fetching documents, Plese make sure the neo4j database server is running"
          );
        }
        const data = await res.json();
        setDocuments(data || []);

        // decide which doc to activate
        if (docId) {
          setActiveDocId(docId);
        } else if (data.length > 0) {
          setActiveDocId(data[0].id);
        }
      } catch (err: unknown) {
        if (err instanceof Error && err.message.includes("Failed to fetch")) {
          setError(
            "Failed to fetch documents. Please ensure the backend server is running."
          );
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError("An unknown error occurred while fetching documents.");
        }
      }
    };
    fetchDocuments();
  }, [docId]);

  // Fetch graph when activeDocId changes
  useEffect(() => {
    if (!activeDocId) return;

    const fetchGraph = async () => {
      try {
        setLoading(true);
        setError(null);
        setElements([]);

        const response = await fetch(
          `http://127.0.0.1:8000/graph/${activeDocId}`
        );
        if (!response.ok)
          throw new Error(`There is no graph available for this file`);
        const data = await response.json();

        const cyElements = [
          ...data.nodes.map((n: NodeData) => ({
            data: { id: n.id, label: n.label, description: n.description },
            group: "nodes",
          })),
          ...data.edges.map((e: EdgeData) => ({
            data: { source: e.source, target: e.target, label: e.label },
            group: "edges",
          })),
        ];

        setElements(cyElements);
      } catch (err: any) {
        setError(err.message || "Failed to load graph");
        console.log("This is from activeDocID fetch", err);
      } finally {
        setLoading(false);
      }
    };

    fetchGraph();
  }, [activeDocId]);

  const handleDocClick = (id: string) => {
    setActiveDocId(id);
    navigate(".", { state: { docId: id } }); // update URL state
  };

  return (
    <div style={{ display: "flex", height: "100vh", width: "100%" }}>
      {/* Sidebar */}
      <div
        className={clsx(
          "bg-white border-r border-gray-300 transition-all duration-300 overflow-y-auto overflow-x-hidden",
          sidebarOpen ? "w-64" : "w-12"
        )}
      >
        <div className="flex items-center justify-between">
          {sidebarOpen ? (
            <h2 className="p-3 font-semibold text-gray-700 border-b">
              Documents
            </h2>
          ) : null}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2  text-left text-sm"
          >
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        {sidebarOpen && (
          <div className="">
            {documents.length === 0 && (
              <p className="p-3 text-gray-500">No documents available.</p>
            )}
            <ul>
              {documents.map((doc) => (
                <li
                  key={doc.id}
                  onClick={() => handleDocClick(doc.id)}
                  className={clsx(
                    "p-3 cursor-pointer text-ellipsis  hover:bg-blue-100",
                    activeDocId === doc.id && "bg-blue-200 font-semibold"
                  )}
                >
                  {doc.title || `Doc ${doc.id}`}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Graph area */}
      <div className="flex-1 bg-gray-50 ">
        {loading && <p className="p-4 text-gray-600">Loading graph...</p>}
        {error && <p className="p-4 text-red-600">Error: {error}</p>}
        {!loading && !error && elements.length === 0 && (
          <p className="p-4 text-gray-600">No graph data available.</p>
        )}
        {!loading && !error && elements.length > 0 && (
          <CytoscapeComponent
            zoomingEnabled={true}
            minZoom={0.1}
            maxZoom={10}
            zoom={1}
            elements={CytoscapeComponent.normalizeElements(elements)}
            layout={{
              name: "preset",
              positions: () => {
                return {x:0,y:0}; // use existing positions if available
              }
            }}
            style={{ width: "100%", height: "100%", background: "#f0f0f0" }}
            cy={(cy) => {
              
              // Attach tooltips
              cy.nodes().forEach((node) => {
                const desc = node.data("description");
                let tip: any = null;

                node.on("mouseover", () => {
                  if (desc && !tip) {
                    tip = node.popper({
                      content: () => {
                        const content = document.createElement("div");
                        content.innerHTML = desc;
                        return content;
                      },
                    });
                    tip.show();
                  }
                });

                node.on("mouseout", () => {
                  if (tip) {
                    tip.destroy();
                    tip = null;
                  }
                });
              });
            }}
            stylesheet={[
              {
                selector: "node",
                style: {
                  label: "data(label)",
                  "background-color": "#0074D9",
                  color: "#fff",
                  "text-valign": "center",
                  "text-halign": "center",
                  "font-size": "12px",
                  "text-outline-color": "#0074D9",
                  "text-outline-width": 2,
                },
              },
              {
                selector: "edge",
                style: {
                  label: "data(label)",
                  width: 2,
                  "line-color": "#ccc",
                  "target-arrow-color": "#ccc",
                  "target-arrow-shape": "triangle",
                  "curve-style": "bezier",
                  "font-size": "10px",
                  "text-background-color": "#fff",
                  "text-background-opacity": 1,
                  "text-background-padding": "2px",
                },
              },
            ]}
          />
        )}
      </div>
    </div>
  );
};

export default GraphViewerPage;
