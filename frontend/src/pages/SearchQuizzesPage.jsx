import React, { useEffect, useState } from "react";
import axiosInstance from "../utils/axiosInstance";
import { useLocation, useParams } from "react-router-dom";
import { useLoading } from "../contexts/LoadingContext";
import QuizCard from "../components/QuizCard";

export default function SearchQuizzesPage() {
  const location = useLocation();
  const params = useParams();
  const routeQuery = params.query ? decodeURIComponent(params.query) : null;
  const initialQuery =
    routeQuery !== null
      ? routeQuery
      : (location.state && location.state.query) || "";

  const [filter, setFilter] = useState("all"); // all | public | mine
  const [query, setQuery] = useState(initialQuery);
  // Synchronise la query interne avec le param route
  useEffect(() => {
    const q = params.query
      ? decodeURIComponent(params.query)
      : (location.state && location.state.query) || "";
    setQuery(q || "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.query]);
  const [publicQuizzes, setPublicQuizzes] = useState([]);
  const [myQuizzes, setMyQuizzes] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 9; // number of cards per page and therefore max detail calls per page
  const [sortBy, setSortBy] = useState("updated_desc"); // updated_desc | updated_asc | questions_desc | questions_asc
  const [minQuestions, setMinQuestions] = useState(0);
  const [maxQuestions, setMaxQuestions] = useState(9999);
  const { loading, showLoading, hideLoading } = useLoading() || {};

  useEffect(() => {
    const fetchQuizzes = async () => {
      if (typeof showLoading === "function")
        showLoading("Loading quizzes...", true);
      try {
        const publicResp = await axiosInstance.get(`/quizz?scope=public`);
        // tag public quizzes so children know their source
        setPublicQuizzes(
          (publicResp.data || []).map((q) => ({ ...q, __source: "public" }))
        );
      } catch (err) {
        console.error("Failed to fetch public quizzes", err);
        setPublicQuizzes([]);
      }

      try {
        const mineResp = await axiosInstance.get(`/quizz?scope=mine`);
        // tag mine quizzes and mark explicit ownership
        setMyQuizzes(
          (mineResp.data || []).map((q) => ({
            ...q,
            __source: "mine",
            isOwner: true,
          }))
        );
      } catch (err) {
        // if not logged in or error, just keep mine empty
        setMyQuizzes([]);
      }
      if (typeof hideLoading === "function") hideLoading();
    };

    fetchQuizzes();
  }, []);

  const loadedDetailsRef = React.useRef(new Set());

  const applyFiltersAndSort = (list) => {
    const minQ = Number(minQuestions) || 0;
    const maxQ = Number(maxQuestions) || 9999;
    let res = list.filter(
      (q) => (q.questionCount || 0) >= minQ && (q.questionCount || 0) <= maxQ
    );

    if (sortBy === "updated_desc") {
      res = res.sort(
        (a, b) =>
          new Date(b.updated_at || b.created_at || 0) -
          new Date(a.updated_at || a.created_at || 0)
      );
    } else if (sortBy === "updated_asc") {
      res = res.sort(
        (a, b) =>
          new Date(a.updated_at || a.created_at || 0) -
          new Date(b.updated_at || b.created_at || 0)
      );
    } else if (sortBy === "questions_desc") {
      res = res.sort((a, b) => (b.questionCount || 0) - (a.questionCount || 0));
    } else if (sortBy === "questions_asc") {
      res = res.sort((a, b) => (a.questionCount || 0) - (b.questionCount || 0));
    }
    return res;
  };

  // Combine public et mes quizzes, sans doublons
  const combinedUnique = (() => {
    const combined = [...myQuizzes, ...publicQuizzes];
    const unique = [];
    const seen = new Set();
    for (const q of combined) {
      if (!q || q.id == null) continue; // defensive: skip malformed entries
      if (!seen.has(q.id)) {
        seen.add(q.id);
        unique.push(q);
      }
    }
    return unique;
  })();

  // Charge les détails pour tous les quizzes combinés
  useEffect(() => {
    let cancelled = false;
    const all = combinedUnique.filter(
      (q) => !loadedDetailsRef.current.has(q.id)
    );
    if (all.length === 0) return;

    // Pool de concurrence limité
    const concurrency = 3;
    let idx = 0;

    const worker = async () => {
      while (!cancelled && idx < all.length) {
        const current = all[idx++];
        try {
          const resp = await axiosInstance.get(`/quizz/${current.id}`);
          const data = resp.data || {};
          loadedDetailsRef.current.add(current.id);
          setPublicQuizzes((prev) =>
            prev.map((p) =>
              p.id === current.id
                ? {
                    ...p,
                    image: data.image || p.image,
                    questionCount:
                      (data.questions || []).length || p.questionCount,
                  }
                : p
            )
          );
          setMyQuizzes((prev) =>
            prev.map((p) =>
              p.id === current.id
                ? {
                    ...p,
                    image: data.image || p.image,
                    questionCount:
                      (data.questions || []).length || p.questionCount,
                  }
                : p
            )
          );
        } catch (err) {
          loadedDetailsRef.current.add(current.id);
          console.warn(`Failed loading details for quiz ${current.id}`, err);
        }
      }
    };

    // Démarre le pool
    const runners = Array.from({ length: concurrency }).map(() => worker());
    Promise.all(runners).catch(() => {});

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [combinedUnique.map((q) => q.id).join(",")]);

  // Applique les filtres et le tri
  const combinedFull = applyFiltersAndSort(
    combinedUnique.filter((q) => {
      const lower = (query || "").toLowerCase();
      if (lower) {
        const inText =
          (q.title || "").toLowerCase().includes(lower) ||
          (q.description || "").toLowerCase().includes(lower);
        if (!inText) return false;
      }
      // respect the 'filter' selection (all/public/mine)
      if (filter === "public" && q.__source !== "public") return false;
      if (filter === "mine" && q.__source !== "mine") return false;
      return true;
    })
  );

  const totalPages = Math.max(1, Math.ceil(combinedFull.length / pageSize));

  // Clamp la page courante si la liste change
  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [totalPages]);

  // Items visibles pour la page courante
  const visibleItems = combinedFull.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  // Charge les détails pour les items visibles uniquement
  useEffect(() => {
    let cancelled = false;
    const toFetch = visibleItems.filter(
      (q) => !loadedDetailsRef.current.has(q.id)
    );
    if (toFetch.length === 0) return;

    const fetchDetails = async () => {
      // limit to pageSize (visibleItems length) already
      await Promise.all(
        toFetch.map(async (q) => {
          try {
            const resp = await axiosInstance.get(`/quizz/${q.id}`);
            const data = resp.data || {};
            // mark loaded
            loadedDetailsRef.current.add(q.id);
            // update in publicQuizzes or myQuizzes depending on source
            setPublicQuizzes((prev) =>
              prev.map((p) =>
                p.id === q.id
                  ? {
                      ...p,
                      image: data.image || p.image,
                      questionCount:
                        (data.questions || []).length || p.questionCount,
                    }
                  : p
              )
            );
            setMyQuizzes((prev) =>
              prev.map((p) =>
                p.id === q.id
                  ? {
                      ...p,
                      image: data.image || p.image,
                      questionCount:
                        (data.questions || []).length || p.questionCount,
                    }
                  : p
              )
            );
          } catch (err) {
            // ignore per-quiz errors but still mark as attempted to avoid retrying endlessly
            loadedDetailsRef.current.add(q.id);
            console.warn(`Failed to load details for quiz ${q.id}`, err);
          }
        })
      );
    };

    fetchDetails();

    return () => {
      cancelled = true;
    };
    // dépendance intentionnelle sur la liste des ids
  }, [visibleItems.map((i) => i.id).join(",")]);

  const filtered = () => {
    const lower = (query || "").toLowerCase();
    const byText = (list) =>
      list.filter(
        (qz) =>
          (qz.title || "").toLowerCase().includes(lower) ||
          (qz.description || "").toLowerCase().includes(lower)
      );
    if (filter === "public") return byText(publicQuizzes);
    if (filter === "mine") return byText(myQuizzes);
    // all: combine public + mine (évite les doublons)
    const combined = [...publicQuizzes, ...myQuizzes];
    const unique = [];
    const seen = new Set();
    for (const q of combined) {
      if (!seen.has(q.id)) {
        seen.add(q.id);
        unique.push(q);
      }
    }
    return byText(unique);
  };

  const handleQuizUpdated = (updated) => {
    setPublicQuizzes((prev) =>
      prev.map((q) => (q.id === updated.id ? { ...q, ...updated } : q))
    );
    setMyQuizzes((prev) =>
      prev.map((q) => (q.id === updated.id ? { ...q, ...updated } : q))
    );
  };

  const handleQuizDeleted = (id) => {
    setPublicQuizzes((prev) => prev.filter((q) => q.id !== id));
    setMyQuizzes((prev) => prev.filter((q) => q.id !== id));
  };

  return (
    <div className="p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-4 flex-wrap">
          <div className="flex items-center gap-2 bg-gray-50 rounded-full p-1">
            <button
              onClick={() => setFilter("all")}
              className={`px-3 py-1 rounded-full ${
                filter === "all" ? "bg-blue-600 text-white" : "text-gray-600"
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter("public")}
              className={`px-3 py-1 rounded-full ${
                filter === "public" ? "bg-blue-600 text-white" : "text-gray-600"
              }`}
            >
              Public
            </button>
            <button
              onClick={() => setFilter("mine")}
              className={`px-3 py-1 rounded-full ${
                filter === "mine" ? "bg-blue-600 text-white" : "text-gray-600"
              }`}
            >
              My Quizzes
            </button>
          </div>

          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white border rounded px-2 py-1">
              <label className="text-sm text-gray-600">Min</label>
              <input
                type="number"
                min="0"
                className="w-16 p-1 border-l pl-2"
                value={minQuestions}
                onChange={(e) => setMinQuestions(e.target.value)}
              />
            </div>
            <div className="flex items-center gap-1 bg-white border rounded px-2 py-1">
              <label className="text-sm text-gray-600">Max</label>
              <input
                type="number"
                min="0"
                className="w-16 p-1 border-l pl-2"
                value={maxQuestions}
                onChange={(e) => setMaxQuestions(e.target.value)}
              />
            </div>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="ml-2 p-2 border rounded bg-white"
            >
              <option value="updated_desc">Newest</option>
              <option value="updated_asc">Oldest</option>
              <option value="questions_desc">Most questions</option>
              <option value="questions_asc">Fewest questions</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {loading ? (
            <div>Loading...</div>
          ) : (
            visibleItems.map((q) => (
              <QuizCard
                key={q.id}
                quiz={q}
                isOwner={q.isOwner}
                onQuizUpdated={handleQuizUpdated}
                onQuizDeleted={handleQuizDeleted}
              />
            ))
          )}
        </div>

        {/* Pagination controls */}
        {/* Refresh button */}
        <div className="flex justify-end mb-4">
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors"
          >
            Refresh
          </button>
        </div>
        {totalPages > 1 && (
          <div className="mt-6 flex items-center justify-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 rounded-md bg-white border"
            >
              ‹
            </button>

            {/* page list with smart ellipses */}
            {(() => {
              const pages = [];
              if (totalPages <= 5) {
                for (let i = 1; i <= totalPages; i++) pages.push(i);
              } else {
                // always show first page
                pages.push(1);

                // determine window of pages to show around currentPage
                let start = Math.max(2, currentPage - 1);
                let end = Math.min(totalPages - 1, currentPage + 1);

                // if we're near the start, show 2..4
                if (currentPage <= 4) {
                  start = 2;
                  end = 4;
                }

                // if we're near the end, show last-3..last-1
                if (currentPage >= totalPages - 3) {
                  start = Math.max(2, totalPages - 3);
                  end = totalPages - 1;
                }

                // show leading ellipsis if there's a gap between 1 and start
                if (start > 2) pages.push("ellipsis");

                for (let p = start; p <= end; p++) pages.push(p);

                // show trailing ellipsis if there's a gap between end and last
                if (end < totalPages - 1) pages.push("ellipsis");

                // always show last page
                pages.push(totalPages);
              }

              return pages.map((p, i) => {
                if (p === "ellipsis")
                  return (
                    <span key={`e-${i}`} className="px-2">
                      …
                    </span>
                  );
                return (
                  <button
                    key={p}
                    onClick={() => setCurrentPage(p)}
                    className={`px-3 py-1 rounded-md ${
                      p === currentPage
                        ? "bg-blue-600 text-white"
                        : "bg-white border"
                    }`}
                  >
                    {p}
                  </button>
                );
              });
            })()}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 rounded-md bg-white border"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
