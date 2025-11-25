/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useMemo, useCallback } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  flexRender,
} from "@tanstack/react-table";
import { motion } from "framer-motion";
import { useAuth } from "../../auth/useAuth";
import Btn from "../../components/Common/Btn";
import Select from "react-select";

export default function AdminUsers() {
  const apiUrl = import.meta.env.VITE_API_URL;
  const { token } = useAuth();

  const [users, setUsers] = useState([]);
  const [filter, setFilter] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Page size options for React Select
  const pageSizeOptions = [
    { value: 15, label: "Show 15" },
    { value: 20, label: "Show 20" },
    { value: 30, label: "Show 30" },
    { value: 40, label: "Show 40" },
    { value: 50, label: "Show 50" },
  ];

  // Fetch all users
  const fetchUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(`${apiUrl}/api/user`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUsers(res.data.data);
    } catch (err) {
      toast.error("Failed to load users");
      console.error("Error fetching users:", err);
    } finally {
      setIsLoading(false);
    }
  }, [apiUrl, token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Delete user
  const handleDelete = useCallback(
    async (id) => {
      if (!confirm("Are you sure you want to delete this user?")) return;

      try {
        await axios.delete(`${apiUrl}/api/user/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUsers((prev) => prev.filter((u) => u._id !== id));
        toast.success("User deleted successfully");
      } catch (err) {
        toast.error("Failed to delete user");
        console.error("Delete error:", err);
      }
    },
    [apiUrl, token]
  );

  // Role toggle
  const handleToggleRole = useCallback(
    async (id) => {
      try {
        const res = await axios.patch(
          `${apiUrl}/api/user/toggle-role/${id}`,
          {},
          { headers: { Authorization: `Bearer ${token}` } }
        );

        setUsers((prev) => prev.map((u) => (u._id === id ? res.data.data : u)));

        toast.success("User role updated successfully");
      } catch (err) {
        toast.error("Failed to change user role");
        console.error("Role toggle error:", err);
      }
    },
    [apiUrl, token]
  );

  // React Table Columns (for desktop)
  const columns = useMemo(
    () => [
      { accessorKey: "name", header: "Name" },
      { accessorKey: "email", header: "Email" },
      { accessorKey: "phoneNumber", header: "Phone" },
      { accessorKey: "role", header: "Role" },
      {
        id: "actions",
        header: "Actions",
        cell: ({ row }) => (
          <div className="flex gap-2 flex-wrap">
            <Btn
              variant="primary"
              onClick={() => handleToggleRole(row.original._id)}
              className="p-2 rounded-lg"
            >
              <i className="fa-solid fa-user-gear text-sm"></i>
            </Btn>
            <Btn
              variant="danger"
              onClick={() => handleDelete(row.original._id)}
              className="p-2 rounded-lg"
            >
              <i className="fa-solid fa-trash-can text-sm"></i>
            </Btn>
          </div>
        ),
      },
    ],
    [handleDelete, handleToggleRole]
  );

  const table = useReactTable({
    data: users,
    columns,
    state: { globalFilter: filter },
    onGlobalFilterChange: setFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: {
      pagination: {
        pageSize: 15,
      },
    },
  });

  return (
    <motion.div
      className="max-w-7xl mx-auto p-6 font-urbanist"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">User Management</h1>
          <p className="text-secondary/55 mt-2">
            Manage user accounts and permissions
          </p>
        </div>
        <div className="text-sm text-secondary bg-container px-4 py-2 rounded-lg">
          Total Users: {users.length}
        </div>
      </div>

      {/* Search */}
      <div className="bg-primarybg rounded-xl shadow-sm border border-secondary/20 p-6 mb-6">
        <div className="flex flex-col gap-4 sm:items-center">
          <div className="flex-1 w-full">
            <label
              htmlFor="search"
              className="block text-sm font-medium text-warning/55 mb-2"
            >
              Search Users
            </label>
            <div className="relative">
              <input
                id="search"
                type="text"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                placeholder="Search by name, email, or phone..."
                className="w-full border border-secondary/40 rounded-full px-4 py-2 pl-10 pr-10
                  focus:outline-none focus:ring-2 focus:ring-primary/65 focus:border-transparent
                  shadow-sm bg-container text-secondary placeholder-secondary/45 truncate"
              />
              <i className="fa-solid fa-magnifying-glass absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary/55"></i>
            </div>
          </div>
          <Btn
            variant="primary"
            onClick={fetchUsers}
            disabled={isLoading}
            className="px-4 py-2 rounded-full mt-2 sm:mt-0 flex items-center gap-2 disabled:opacity-50"
          >
            <i
              className={`fa-solid ${
                isLoading ? "fa-rotate fa-spin" : "fa-refresh"
              }`}
            ></i>
            Refresh
          </Btn>
        </div>
      </div>

      {/* Desktop Table */}
      <div className="hidden sm:block bg-primarybg rounded-xl shadow-sm border border-secondary/20 overflow-hidden">
        <div className="overflow-x-auto">
          {/* Table starts here */}
          <table className="w-full">
            <thead className="bg-secondary/5 border-b border-secondary/25">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="p-4 font-semibold text-info text-left text-sm uppercase tracking-wider"
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>
            {/* Table Body */}
            <tbody className="divide-y divide-secondary/20">
              {table.getRowModel().rows.map((row, rowIndex) => (
                <tr
                  key={row.id}
                  className={`hover:bg-container/55 ${
                    rowIndex % 2 === 0 ? "bg-primary/5" : "bg-secondary/5"
                  }`}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="p-4">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="flex items-center justify-between p-4 border-t border-secondary/25 bg-secondary/5">
          <div className="flex items-center gap-2">
            <span className="text-sm text-info">
              Page{" "}
              <strong>
                {table.getState().pagination.pageIndex + 1} of{" "}
                {table.getPageCount()}
              </strong>
            </span>
            <span className="text-sm text-secondary">
              | Go to page:
              <input
                type="number"
                defaultValue={table.getState().pagination.pageIndex + 1}
                onChange={(e) => {
                  const page = e.target.value ? Number(e.target.value) - 1 : 0;
                  table.setPageIndex(page);
                }}
                className="border border-secondary/25 rounded px-2 py-1 w-16 mx-2"
                min="1"
                max={table.getPageCount()}
              />
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Btn
              variant="secondary"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded-lg disabled:opacity-50"
            >
              <i className="fa-solid fa-angles-left"></i>
            </Btn>
            <Btn
              variant="secondary"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded-lg disabled:opacity-50"
            >
              <i className="fa-solid fa-angle-left"></i>
            </Btn>
            <Btn
              variant="secondary"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded-lg disabled:opacity-50"
            >
              <i className="fa-solid fa-angle-right"></i>
            </Btn>
            <Btn
              variant="secondary"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded-lg disabled:opacity-50"
            >
              <i className="fa-solid fa-angles-right"></i>
            </Btn>
          </div>

          <div className="flex items-center gap-2">
            <Select
              value={pageSizeOptions.find(
                (option) =>
                  option.value === table.getState().pagination.pageSize
              )}
              onChange={(selectedOption) => {
                table.setPageSize(Number(selectedOption.value));
              }}
              styles={{
                control: (base) => ({
                  ...base,
                  border: "1px solid #d1d5db",
                  borderRadius: "0.375rem",
                  fontSize: "0.875rem",
                  minHeight: "32px",
                }),
                menuPortal: (base) => ({ ...base, zIndex: 9999 }),
              }}
              menuPortalTarget={document.body}
              options={pageSizeOptions}
              className="w-32"
              classNamePrefix="react-select"
              isSearchable={false}
            />
          </div>
        </div>
      </div>

      {/* Mobile Cards */}
      <div className="sm:hidden flex flex-col gap-4">
        {table.getRowModel().rows.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <i className="fa-solid fa-users text-4xl text-secondary/30 mb-4"></i>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No users found
            </h3>
            <p className="text-gray-600">
              {filter
                ? "Try adjusting your search criteria"
                : "No users available in the system"}
            </p>
          </div>
        )}

        {table.getRowModel().rows.map((row) => (
          <div
            key={row.original._id}
            className="bg-white p-4 rounded-xl shadow border border-gray-200"
          >
            <p>
              <span className="font-semibold text-secondary/80">Name: </span>
              {row.original.name}
            </p>
            <p>
              <span className="font-semibold text-secondary/80">Email: </span>
              {row.original.email}
            </p>
            <p>
              <span className="font-semibold text-secondary/80">Phone: </span>
              {row.original.phoneNumber || "N/A"}
            </p>
            <p>
              <span className="font-semibold text-secondary/80">Role: </span>
              <span
                className={`px-2 py-1 rounded-full text-xs font-semibold ${
                  row.original.role === "admin"
                    ? "bg-success/10 text-success border border-success/20"
                    : "bg-primary/10 text-primary border border-primary/20"
                }`}
              >
                {row.original.role}
              </span>
            </p>
            <div className="flex gap-2 mt-3 flex-wrap">
              <Btn
                variant="primary"
                onClick={() => handleToggleRole(row.original._id)}
                className="p-2 rounded-lg flex-1 whitespace-nowrap text-xs xs:text-sm"
              >
                <i className="fa-solid fa-user-gear text-xs"></i> Toggle Role
              </Btn>
              <Btn
                variant="danger"
                onClick={() => handleDelete(row.original._id)}
                className="p-2 rounded-lg flex-1"
              >
                <i className="fa-solid fa-trash-can text-sm"></i> Delete
              </Btn>
            </div>
          </div>
        ))}

        {/* Mobile Pagination */}
        <div className="flex flex-col gap-4 items-center justify-center py-4">
          <div className="flex gap-2">
            <Btn
              variant="secondary"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded-lg disabled:opacity-50"
            >
              <i className="fa-solid fa-angles-left"></i>
            </Btn>
            <Btn
              variant="secondary"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
              className="px-3 py-1 rounded-lg disabled:opacity-50"
            >
              <i className="fa-solid fa-angle-left"></i>
            </Btn>
            <span className="px-3 py-1 text-sm text-info whitespace-nowrap">
              {table.getState().pagination.pageIndex + 1} /{" "}
              {table.getPageCount()}
            </span>
            <Btn
              variant="secondary"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded-lg disabled:opacity-50"
            >
              <i className="fa-solid fa-angle-right"></i>
            </Btn>
            <Btn
              variant="secondary"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
              className="px-3 py-1 rounded-lg disabled:opacity-50"
            >
              <i className="fa-solid fa-angles-right"></i>
            </Btn>
          </div>

          <Select
            value={pageSizeOptions.find(
              (option) => option.value === table.getState().pagination.pageSize
            )}
            onChange={(selectedOption) => {
              table.setPageSize(Number(selectedOption.value));
            }}
            options={pageSizeOptions}
            styles={{
              control: (base) => ({
                ...base,
                border: "1px solid #d1d5db",
                borderRadius: "0.375rem",
                fontSize: "0.875rem",
                minHeight: "32px",
              }),
              menuPortal: (base) => ({ ...base, zIndex: 9999 }),
            }}
            menuPortalTarget={document.body}
            className="w-32"
            classNamePrefix="react-select"
            isSearchable={false}
          />
        </div>
      </div>
    </motion.div>
  );
}
