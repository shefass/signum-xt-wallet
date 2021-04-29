import React, { FC, useCallback, useMemo, useState } from "react";

import classNames from "clsx";

import Money from "app/atoms/Money";
import { openInFullPage, useAppEnv } from "app/env";
import { ReactComponent as InfoIcon } from "app/icons/info.svg";
import DAppIcon from "app/templates/DAppsList/DAppIcon";
import DAppItem from "app/templates/DAppsList/DAppItem";
import StarButton from "app/templates/DAppsList/StarButton";
import InUSD from "app/templates/InUSD";
import SearchField from "app/templates/SearchField";
import { getDApps } from "lib/custom-dapps-api";
import { t } from "lib/i18n/react";
import { useRetryableSWR } from "lib/swr";
import { TEZ_ASSET } from "lib/temple/assets";
import { useStorage } from "lib/temple/front";

const USED_TAGS = [
  "DEX",
  "NFT",
  "DAO",
  "Game",
  "Social",
  "Marketplace",
  "Farming",
  "Other",
];
const TOP_DAPPS_SLUGS = ["quipuswap", "kolibri", "hen"];

const FAVORITE_DAPPS_STORAGE_KEY = "dapps_favorite";

const DAppsList: FC = () => {
  const [favoriteDApps, setFavoriteDApps] = useStorage<string[]>(
    FAVORITE_DAPPS_STORAGE_KEY,
    []
  );
  const { popup } = useAppEnv();
  const { data } = useRetryableSWR("dapps-list", getDApps, { suspense: true });
  const dApps = useMemo(() => {
    return data!.dApps.map(({ categories: rawCategories, ...restProps }) => {
      const nonUniqueCategories = rawCategories.map((category) =>
        USED_TAGS.includes(category) ? category : "Other"
      );
      const categories = nonUniqueCategories.filter((name) => name !== "Other");
      if (categories.length !== nonUniqueCategories.length) {
        categories.push("Other");
      }

      return {
        categories,
        ...restProps,
      };
    });
  }, [data]);

  const [searchString, setSearchString] = useState("");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [showOnlyFavorite, setShowOnlyFavorite] = useState(false);

  const toggleFavoriteFilter = useCallback(
    () => setShowOnlyFavorite((prevValue) => !prevValue),
    []
  );

  const handleTagClick = useCallback((name: string) => {
    setSelectedTags((prevSelectedTags) => {
      const tagIndex = prevSelectedTags.indexOf(name);
      const newSelectedTags = [...prevSelectedTags];
      if (tagIndex === -1) {
        newSelectedTags.push(name);
      } else {
        newSelectedTags.splice(tagIndex, 1);
      }
      return newSelectedTags;
    });
  }, []);

  const featuredDApps = useMemo(() => {
    const topDApps = dApps.filter(({ slug }) =>
      TOP_DAPPS_SLUGS.some((topDAppSlug) => topDAppSlug === slug)
    );
    const otherDApps = dApps.filter(
      ({ slug }) => !TOP_DAPPS_SLUGS.some((topDAppSlug) => topDAppSlug === slug)
    );
    return [...topDApps, ...otherDApps.slice(0, 3 - topDApps.length)];
  }, [dApps]);

  const matchingDApps = useMemo(() => {
    return dApps.filter(
      ({ name, categories, slug }) =>
        name.toLowerCase().includes(searchString.toLowerCase()) &&
        selectedTags.every((selectedTag) => categories.includes(selectedTag)) &&
        (!showOnlyFavorite || favoriteDApps.includes(slug))
    );
  }, [dApps, searchString, selectedTags, favoriteDApps, showOnlyFavorite]);

  const handleFavoriteChange = useCallback(
    (newIsFavorite: boolean, slug: string) => {
      const newFavorites = [...favoriteDApps];
      if (newIsFavorite) {
        newFavorites.push(slug);
      } else {
        newFavorites.splice(newFavorites.indexOf(slug), 1);
      }
      setFavoriteDApps(newFavorites);
    },
    [setFavoriteDApps, favoriteDApps]
  );

  return (
    <div
      className={classNames(
        popup ? "px-1 pb-12" : "px-5 pb-4",
        "w-full flex pt-2"
      )}
    >
      <div
        className="mx-auto flex flex-col items-center"
        style={{ maxWidth: "25rem" }}
      >
        <div className="mb-2 text-sm text-gray-600 flex items-center leading-tight">
          {t("tvl")}
          <InfoIcon
            style={{
              width: "0.625rem",
              height: "auto",
              marginLeft: "0.125rem",
            }}
            className="stroke-current"
            title="TODO: add text"
          />
        </div>
        <h1 className="text-2xl text-gray-900 mb-2 font-medium leading-tight">
          ~<Money>{data!.tvl}</Money> <span>{TEZ_ASSET.symbol}</span>
        </h1>
        <InUSD volume={data!.tvl} mainnet>
          {(inUSD) => (
            <h2
              className={classNames(
                popup ? "mb-4" : "mb-6",
                "text-base text-gray-600 leading-tight"
              )}
            >
              ~{inUSD} $
            </h2>
          )}
        </InUSD>
        <span className="text-sm text-gray-600 mb-2">{t("promoted")}</span>
        <div
          className={classNames(
            popup ? "py-2 mb-4" : "py-6 mb-6",
            "rounded-lg bg-gray-100 w-full flex justify-center"
          )}
        >
          {featuredDApps.slice(0, 3).map(({ slug, name, logo, website }) => (
            <a
              className="mx-4 py-1 flex flex-col items-center"
              key={slug}
              href={website}
              target="_blank"
              rel="noreferrer"
            >
              <DAppIcon className="mb-2" name={name} logo={logo} />
              <span
                className={classNames(
                  !popup && "w-20",
                  "text-center overflow-hidden text-gray-900"
                )}
                style={{
                  textOverflow: "ellipsis",
                  width: popup ? "4.5rem" : undefined,
                }}
              >
                {name}
              </span>
            </a>
          ))}
        </div>
        <SearchField
          className={classNames(
            "py-2 pl-8 pr-4",
            "border border-gray-300",
            "transition ease-in-out duration-200",
            "rounded-lg",
            "text-gray-700 text-sm leading-tight",
            "placeholder-alphagray"
          )}
          containerClassName="mb-4"
          placeholder={t("searchDApps")}
          searchIconClassName="h-4 w-auto"
          searchIconWrapperClassName="px-2 text-gray-700"
          value={searchString}
          onValueChange={setSearchString}
        />
        <div
          className={classNames(
            popup ? "mb-4" : "mb-6",
            "w-full flex justify-between"
          )}
        >
          <div
            className={classNames(!popup && "mr-2", "flex-1 flex flex-wrap")}
          >
            {USED_TAGS.map((tag) => (
              <Tag
                key={tag}
                name={tag}
                onClick={handleTagClick}
                selected={selectedTags.includes(tag)}
              />
            ))}
          </div>

          {!popup && (
            <StarButton
              className="flex-shrink-0"
              iconClassName="w-6 h-auto"
              isActive={showOnlyFavorite}
              onClick={toggleFavoriteFilter}
            />
          )}
        </div>
        {matchingDApps.length === 0 && (
          <p className="text-sm text-center text-gray-700 mb-4">
            {t("noMatchingDAppsFound")}
          </p>
        )}
        {matchingDApps
          .slice(0, popup ? 3 : matchingDApps.length)
          .map((dAppProps) => (
            <DAppItem
              {...dAppProps}
              key={dAppProps.slug}
              onStarClick={handleFavoriteChange}
              isFavorite={favoriteDApps.includes(dAppProps.slug)}
              tvl={dAppProps.tvl}
            />
          ))}
      </div>
      <div
        className={classNames(
          "absolute bottom-0 left-0 h-16 bg-gray-200 w-full",
          !popup && "hidden"
        )}
        style={{ padding: "0.625rem 1.25rem" }}
      >
        <button
          className={classNames(
            "bg-white w-full h-full border border-blue-500 rounded flex shadow-sm",
            "justify-center items-center font-medium text-sm text-blue-500 leading-tight"
          )}
          type="button"
          onClick={openInFullPage}
        >
          {t("viewAll")}
        </button>
      </div>
    </div>
  );
};

export default DAppsList;

type TagProps = {
  name: string;
  onClick: (name: string) => void;
  selected: boolean;
};

const Tag: FC<TagProps> = ({ name, onClick, selected }) => {
  const handleClick = useCallback(() => onClick(name), [onClick, name]);

  return (
    <button
      className={classNames(
        "mr-2 mb-2 h-6 inline-flex items-center rounded-full px-4",
        "border border-gray-300 text-xs text-gray-900 hover:bg-gray-200",
        selected && "bg-gray-200"
      )}
      onClick={handleClick}
      type="button"
    >
      {t(name.toLowerCase()) || name}
    </button>
  );
};