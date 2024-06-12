import { ArrowUpTrayIcon } from "@heroicons/react/20/solid";
import { ActionIcon, Flex, Input } from "@mantine/core";
import React, { useState } from "react";
import { uploadFile } from "~/utils/api";

export default function FileUpload({
  onUpload,
}: {
  onUpload: (sessionId: string) => void;
}) {
  const handleFileChange = (event) => {
    handleFileUpload(event.target.files[0]);
  };

  const handleFileUpload = async (file: File | undefined) => {
    if (!file) {
      alert("Please select a file to upload");
      return;
    }

    try {
      const data = await uploadFile(file);
      onUpload(data.session_id);
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <Flex justify="center" align="center" gap="sm">
      <Input type="file" size="md" onChange={handleFileChange} />
    </Flex>
  );
}
