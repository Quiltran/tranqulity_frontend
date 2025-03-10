export async function uploadAttachment(token: string, attachment: File) {
    let formData = new FormData();
    formData.append('name', attachment.name);
    formData.append('file', attachment);

    let response = await fetch(`${import.meta.env.VITE_API_URL}/api/attachment`, {
        method: 'POST',
        headers: {
            authorization: `Bearer ${token}`
        },
        body: formData
    });
    if (!response.ok) {
        alert('An error occurred while uploading your attachments.');
        throw new Error('Unable to upload attachments.');
    }

    if (response.status !== 201) {
        alert('The server responded with an error while uploading your attachment.');
        throw new Error('Unable to upload attachments.');
    }

    let data = (await response.json()) as Attachment;
    return data;
}