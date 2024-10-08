import React, { useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Button, Input, RTE, Select, Loader } from "..";
import appwriteService from "../../appwrite/config";
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

export default function PostForm({ post }) {
  const { register, handleSubmit, watch, setValue, control, getValues } =
    useForm({
      defaultValues: {
        title: post?.title || "",
        slug: post?.$id || "",
        content: post?.content || "",
        status: post?.status || "active",
      },
    });

  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const userData = useSelector((state) => state.auth.userData);
  const [error, setError] = useState("");

  const submit = async (data) => {
    setIsLoading(true);
    try {
      if (post) {
        const file = data.image[0]
          ? await appwriteService.uploadFile(data.image[0])
          : null;

        if (file) {
          appwriteService.deleteFile(post.featuredImage);
        }

        const dbPost = await appwriteService.updatePost(post.$id, {
          ...data,
          featuredImage: file ? file.$id : undefined,
        });

        if (dbPost) {
          navigate(`/post/${dbPost.$id}`);
        }
        setIsLoading(false);
      } else {
        const file = await appwriteService.uploadFile(data.image[0]);

        if (file) {
          const fileId = file.$id;
          data.featuredImage = fileId;
          const dbPost = await appwriteService.createPost({
            ...data,
            userId: userData.$id,
          });

          if (dbPost) {
            navigate(`/post/${dbPost.$id}`);
          }

          setIsLoading(false);
        }
      }
    } catch (error) {
      console.log("Post Form :: error", error);
      setError(error.message);
      setIsLoading(false);
    }
  };

  const slugTransform = useCallback((value) => {
    if (value && typeof value === "string")
      return value
        .trim()
        .toLowerCase()
        .replace(/[^a-zA-Z\d\s]+/g, "-")
        .replace(/\s/g, "-");

    return "";
  }, []);

  React.useEffect(() => {
    const subscription = watch((value, { name }) => {
      if (name === "title") {
        setValue("slug", slugTransform(value.title), { shouldValidate: true });
      }
    });

    return () => subscription.unsubscribe();
  }, [watch, slugTransform, setValue]);

  return !isLoading ? (
    <form
      onSubmit={handleSubmit(submit)}
      className="flex flex-wrap w-full mx-auto rounded-lg px-4 py-6 text-white bg-black bg-opacity-5 dark:bg-white dark:bg-opacity-10 backdrop-blur-lg border border-gray-600 border-opacity-50 "
    >
      <div className="w-full">
        <Input
          label="Title"
          placeholder="Title"
          className="mb-4 text-black font-semibold text-lg"
          labelClassName="text-xl text-black dark:text-white"
          required
          {...register("title", { required: true })}
        />
        <Input
          label="Slug"
          placeholder="Slug"
          className="mb-4"
          labelClassName="text-xl text-black dark:text-white"
          readOnly
          {...register("slug", { required: true })}
          onInput={(e) => {
            setValue("slug", slugTransform(e.currentTarget.value), {
              shouldValidate: true,
            });
          }}
        />
        <RTE
          label="Content"
          name="content"
          required
          control={control}
          labelClassName="text-xl font-semibold text-black dark:text-white"
          defaultValue={getValues("content")}
        />
      </div>
      <div className="w-full">
        <Input
          label="Featured Image"
          type="file"
          className="mb-4"
          labelClassName="text-xl mt-4 text-black dark:text-white"
          accept="image/png, image/jpg, image/jpeg, image/gif"
          {...register("image", { required: !post })}
        />
        {post && (
          <div className="w-full mb-4">
            <img
              src={appwriteService.getFilePreview(post.featuredImage)}
              alt={post.title}
              width={300}
              className="rounded-lg"
            />
          </div>
        )}
        <Select
          options={["active", "inactive"]}
          label="Status"
          className="mb-4 "
          labelClassName="text-xl font-semibold flex ms-1 mb-1 text-black dark:text-white"
          {...register("status", { required: true })}
        />
        <Button
          type="submit"
          bgColor={
            post
              ? "bg-green-500 hover:bg-green-600 active:bg-green-400"
              : undefined
          }
          className="w-full mt-2 bg-blue-500 hover:bg-blue-400 active:bg-blue-700"
        >
          {post ? "Update" : "Submit"}
        </Button>

        {error && <p className="text-red-600">{error}</p>}
      </div>
    </form>
  ) : (
    <Loader />
  );
}
